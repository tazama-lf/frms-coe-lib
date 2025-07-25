import { validateDatabaseConfig } from './database.config';
import { validateLocalCacheConfig } from './localcache.config';
import { validateAPMConfig, validateLogConfig } from './monitoring.config';
import { validateProcessorConfig } from './processor.config';
import { validateRedisConfig } from './redis.config';
/**
 * Validates and retrieves the specified environment variable.
 *
 * @param {string} name - The name of the environment variable to validate.
 * @param {'string' | 'number' | 'boolean'} type - The expected type of the environment variable.
 * @param {boolean} optional - Is this variable optional (Defaults to false)
 * @returns {'string' | 'number' | 'boolean'} - The value of the environment variable, cast to the specified type.
 * @throws {Error} - Throws an error if the environment variable is not defined, or if the value cannot be converted to the specified type.
 *
 * @example
 * const port = validateEnvVar<number>('PORT', 'number');
 * const env = validateEnvVar<string>('NODE_ENV', 'string');
 * const apiKey = validateEnvVar<string>('API_KEY', 'string', true);
 */
export function validateEnvVar(name: string, type: 'string' | 'number' | 'boolean', optional = false): string | number | boolean {
  const value = process.env[name] ?? '';

  if (value === '' && optional) {
    return '';
  }

  if (value === '') {
    throw new Error(`Environment variable ${name} is not defined.`);
  }

  if (value && !value.trim().length && optional) {
    throw new Error(`Environment variable ${name} is optional but set to a string with whitespaces only. Consider removing it.`);
  }

  let numValue;
  switch (type) {
    case 'string':
      return value;
    case 'number':
      numValue = Number(value);
      if (isNaN(numValue)) {
        throw new Error(`Environment variable ${name} is not a valid number.`);
      }
      return numValue;
    case 'boolean':
      if (value.toLowerCase() === 'true') {
        return true;
      } else if (value.toLowerCase() === 'false') {
        return false;
      }
      throw new Error(`Environment variable ${name} is not a valid boolean.`);
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
