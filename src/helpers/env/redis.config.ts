import { validateEnvVar } from '.';
import { type RedisConfig } from '../../interfaces';

/**
 * Validates and retrieves the Redis configuration from environment variables.
 *
 * @param {boolean} authEnabled - Indicates whether authentication is enabled for Redis.
 * @returns {RedisConfig} - The validated Redis configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const redisConfig = validateRedisConfig(true);
 */
export const validateRedisConfig = (authEnabled: boolean): RedisConfig => {
  const password = validateEnvVar<string>('REDIS_AUTH', 'string', !authEnabled);

  return {
    db: validateEnvVar('REDIS_DATABASE', 'string'),
    password,
    servers: JSON.parse(validateEnvVar('REDIS_SERVERS', 'string')),
    isCluster: validateEnvVar('REDIS_IS_CLUSTER', 'boolean'),
    distributedCacheEnabled: validateEnvVar('DISTRIBUTED_CACHE_ENABLED', 'boolean', true),
    distributedCacheTTL: validateEnvVar('DISTRIBUTED_CACHETTL', 'number', true),
  };
};
