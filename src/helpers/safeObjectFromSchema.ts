import { RedisService } from '../services/redis';
import { validateRedisConfig } from '../config/redis.config';

type JsonRecord = Record<string, unknown>;
export interface SafeObject {
  [key: string]: SafeObject;
}

interface SchemaCacheEntry {
  schemaSignature: string;
  pathTypeMap: Map<string, string>;
}

interface SchemaLookupRedisService {
  getJson?: (key: string) => Promise<string>;
  getEndpointSchemaBundle?: (endpointPath: string) => Promise<JsonRecord>;
}

interface SafeObjectOptions {
  redisService?: SchemaLookupRedisService;
  bypassCompileCache?: boolean;
}

const schemaCompileCache = new Map<string, SchemaCacheEntry>();
let redisServiceSingleton: RedisService | undefined;

const isObject = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null && !Array.isArray(value);

const toPath = (basePath: string, propName: string): string => (basePath ? `${basePath}.${propName}` : propName);

const inferNodeType = (schemaNode: unknown): string => {
  if (!isObject(schemaNode)) {
    return 'unknown';
  }

  const schemaType = schemaNode.type;

  if (Array.isArray(schemaType)) {
    const firstType = schemaType.find((item: unknown): item is string => typeof item === 'string' && item !== 'null');
    return firstType ?? 'unknown';
  }

  if (typeof schemaType === 'string') {
    return schemaType;
  }

  if (isObject(schemaNode.properties)) {
    return 'object';
  }

  if (isObject(schemaNode.items)) {
    return 'array';
  }

  return 'unknown';
};

const compileSchemaPaths = (schema: unknown): Map<string, string> => {
  const pathTypeMap = new Map<string, string>();

  const visit = (node: unknown, basePath: string): void => {
    if (!isObject(node)) {
      return;
    }

    const nodeType = inferNodeType(node);
    if (basePath) {
      pathTypeMap.set(basePath, nodeType);
    }

    if (nodeType === 'object' && isObject(node.properties)) {
      Object.entries(node.properties).forEach(([propertyName, propertySchema]) => {
        visit(propertySchema, toPath(basePath, propertyName));
      });
      return;
    }

    if (Array.isArray(node.anyOf)) {
      node.anyOf.forEach((item: unknown) => {
        visit(item, basePath);
      });
    }

    if (Array.isArray(node.oneOf)) {
      node.oneOf.forEach((item: unknown) => {
        visit(item, basePath);
      });
    }

    if (Array.isArray(node.allOf)) {
      node.allOf.forEach((item: unknown) => {
        visit(item, basePath);
      });
    }
  };

  visit(schema, '');
  return pathTypeMap;
};

const parseSchemaBundle = (bundle: unknown, endpointPath: string): JsonRecord => {
  if (!isObject(bundle)) {
    throw new Error(`Invalid schema cache bundle for endpointPath '${endpointPath}'`);
  }

  if (typeof bundle.publishing_status === 'string' && bundle.publishing_status !== 'active') {
    throw new Error(`Schema for endpointPath '${endpointPath}' is not active`);
  }

  if (!isObject(bundle.schema)) {
    throw new Error(`Schema field missing or invalid for endpointPath '${endpointPath}'`);
  }

  return bundle.schema;
};

const coerceLeafValue = (value: unknown, expectedType: string): unknown => {
  if (expectedType === 'number') {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
      return Number(value);
    }
    throw new Error(`Expected number but received '${typeof value}'`);
  }

  if (expectedType === 'boolean') {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
      return value.toLowerCase() === 'true';
    }
    throw new Error(`Expected boolean but received '${typeof value}'`);
  }

  if (expectedType === 'string') {
    if (typeof value === 'string') {
      return value;
    }
    if (value === null || value === undefined) {
      throw new Error(`Expected string but received '${String(value)}'`);
    }
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return String(value);
    }
    throw new Error(`Expected string but received '${typeof value}'`);
  }

  if (expectedType === 'array') {
    if (!Array.isArray(value)) {
      throw new Error(`Expected array but received '${typeof value}'`);
    }
    return value;
  }

  if (expectedType === 'object') {
    if (!isObject(value)) {
      throw new Error(`Expected object but received '${typeof value}'`);
    }
    return value;
  }

  return value;
};

const createSafeProxy = (target: JsonRecord, pathTypeMap: Map<string, string>, basePath: string): SafeObject => {
  if (!isObject(target)) {
    throw new Error(`Cannot create safe proxy for non-object value at path '${basePath || '<root>'}'`);
  }

  return new Proxy(target, {
    get(currentTarget: JsonRecord, prop: string | symbol) {
      if (typeof prop !== 'string') {
        return Reflect.get(currentTarget, prop) as unknown;
      }

      if (prop === 'toJSON') {
        return () => currentTarget;
      }

      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined;
      }

      const nextPath = toPath(basePath, prop);
      if (!pathTypeMap.has(nextPath)) {
        throw new Error(`Path '${nextPath}' does not exist in configured schema`);
      }

      const rawValue = currentTarget[prop];
      if (rawValue === undefined || rawValue === null) {
        throw new Error(`Path '${nextPath}' was not found in payload`);
      }

      const expectedType = pathTypeMap.get(nextPath);
      if (expectedType === undefined) {
        throw new Error(`Path '${nextPath}' does not exist in configured schema`);
      }
      const coercedValue = coerceLeafValue(rawValue, expectedType);

      if (expectedType === 'object') {
        if (!isObject(coercedValue)) {
          throw new Error(`Expected object but received '${typeof coercedValue}'`);
        }
        return createSafeProxy(coercedValue, pathTypeMap, nextPath);
      }

      return coercedValue;
    },
  }) as unknown as SafeObject;
};

const getOrCreateRedisService = async (providedRedisService?: SchemaLookupRedisService): Promise<SchemaLookupRedisService> => {
  if (providedRedisService) {
    return providedRedisService;
  }

  if (redisServiceSingleton) {
    return redisServiceSingleton;
  }

  const managerConfig = validateRedisConfig(false);
  const { redisConfig } = managerConfig;
  if (!redisConfig || redisConfig.distributedCacheEnabled === false) {
    throw new Error('Distributed Redis cache is not enabled for schema lookups');
  }

  redisServiceSingleton = await RedisService.create(redisConfig);
  return redisServiceSingleton;
};

const getSchemaPathMap = (endpointPath: string, schema: JsonRecord, bypassCompileCache: boolean): Map<string, string> => {
  const schemaSignature = JSON.stringify(schema);
  const existing = schemaCompileCache.get(endpointPath);
  if (!bypassCompileCache && existing?.schemaSignature === schemaSignature) {
    return existing.pathTypeMap;
  }

  const pathTypeMap = compileSchemaPaths(schema);
  schemaCompileCache.set(endpointPath, { schemaSignature, pathTypeMap });
  return pathTypeMap;
};

async function createSafeObjectFromEndpoint(endpointPath: string, payload: unknown, options: SafeObjectOptions = {}): Promise<SafeObject> {
  if (typeof endpointPath !== 'string' || endpointPath.trim() === '') {
    throw new Error('endpointPath must be a non-empty string');
  }

  if (!isObject(payload)) {
    throw new Error('payload must be a JSON object');
  }

  const redisService = await getOrCreateRedisService(options.redisService);
  let schemaBundle: unknown;

  if (typeof redisService.getEndpointSchemaBundle === 'function') {
    schemaBundle = await redisService.getEndpointSchemaBundle(endpointPath);
  } else {
    if (typeof redisService.getJson !== 'function') {
      throw new Error('Redis service must provide getJson when getEndpointSchemaBundle is unavailable');
    }
    const cacheText = await redisService.getJson(endpointPath);
    if (!cacheText) {
      throw new Error(`No schema cache found for endpointPath '${endpointPath}'`);
    }

    try {
      schemaBundle = JSON.parse(cacheText) as unknown;
    } catch {
      throw new Error(`Invalid schema cache payload for endpointPath '${endpointPath}'`);
    }
  }

  const schema = parseSchemaBundle(schemaBundle, endpointPath);
  const pathTypeMap = getSchemaPathMap(endpointPath, schema, Boolean(options.bypassCompileCache));

  return createSafeProxy(payload, pathTypeMap, '');
}

export { createSafeObjectFromEndpoint };
