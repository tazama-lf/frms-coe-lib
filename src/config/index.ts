import { validateDatabaseConfig } from './database.config';
import { validateLocalCacheConfig } from './localcache.config';
import { validateAPMConfig, validateLogConfig } from './monitoring.config';
import { validateProcessorConfig } from './processor.config';
import { validateRedisConfig } from './redis.config';
/**
 * Validates and retrieves the specified environment variable.
 *
 * @template T - The expected type of the environment variable.
 * @param {string} name - The name of the environment variable to validate.
 * @param {'string' | 'number' | 'boolean'} type - The expected type of the environment variable.
 * @param {boolean} optional - Is this variable optional (Defaults to false)
 * @returns {T} - The value of the environment variable, cast to the specified type.
 * @throws {Error} - Throws an error if the environment variable is not defined, or if the value cannot be converted to the specified type.
 *
 * @example
 * const port = validateEnvVar<number>('PORT', 'number');
 * const env = validateEnvVar<string>('NODE_ENV', 'string');
 * const apiKey = validateEnvVar<string>('API_KEY', 'string', true);
 */
export function validateEnvVar<T>(name: string, type: 'string' | 'number' | 'boolean', optional: boolean = false): T {
  const value = process.env[name];

  if (value === undefined && !optional) {
    throw new Error(`Environment variable ${name} is not defined.`);
  }

  if (value && !value.trim().length && optional) {
    throw new Error(`Environment variable ${name} is optional but set to a string with whitespaces only. Consider removing it.`);
  }

  let numValue;

  switch (type) {
    case 'string':
      return value as T;
    case 'number':
      numValue = Number(value);
      if (isNaN(numValue) && !optional) {
        throw new Error(`Environment variable ${name} is not a valid number.`);
      }
      return numValue as T;
    case 'boolean':
      if (value === undefined) return undefined as T; // Handle optional
      if (value.toLowerCase() === 'true') {
        return true as T;
      } else if (value.toLowerCase() === 'false') {
        return false as T;
      }
      if (!optional) {
        throw new Error(`Environment variable ${name} is not a valid boolean.`);
      }
      return undefined as T;
    default:
      throw new Error('Unsupported type');
  }
}

export {
  validateAPMConfig,
  validateDatabaseConfig,
  validateLocalCacheConfig,
  validateLogConfig,
  validateProcessorConfig,
  validateRedisConfig,
};
