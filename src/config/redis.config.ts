import { validateEnvVar } from '.';
import type { ManagerConfig } from '../services/dbManager';

export enum Cache {
  /** Distributed cache system. */
  DISTRIBUTED = 'redisConfig',

  /** Node cache storing system. */
  LOCAL = 'localCacheConfig',
}

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
export const validateRedisConfig = (authEnabled: boolean): ManagerConfig => {
  const password = validateEnvVar('REDIS_AUTH', 'string', !authEnabled).toString();

  return {
    redisConfig: {
      db: Number(validateEnvVar('REDIS_DATABASE', 'number')),
      password,
      servers: JSON.parse(validateEnvVar('REDIS_SERVERS', 'string').toString()) as [
        {
          host: string;
          port: number;
        },
      ],
      isCluster: Boolean(validateEnvVar('REDIS_IS_CLUSTER', 'boolean')),
      distributedCacheEnabled: Boolean(validateEnvVar('DISTRIBUTED_CACHE_ENABLED', 'boolean', true)),
      distributedCacheTTL: Number(validateEnvVar('DISTRIBUTED_CACHETTL', 'number', true)),
    },
  };
};
