import { validateEnvVar } from '.';

/**
 * Interface representing the configuration for Redis.
 */
export interface RedisConfig {
  /** The database number to use. */
  db: string;

  /** The authentication password for Redis (optional). */
  auth?: string;

  /** The servers for the Redis instance(s). */
  servers: string;

  /** Indicates whether the Redis configuration is for a cluster. */
  isCluster: boolean;
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
export const validateRedisConfig = (authEnabled: boolean): RedisConfig => {
  let auth: string | undefined;

  if (authEnabled) {
    auth = validateEnvVar('REDIS_AUTH', 'string');
  }

  return {
    db: validateEnvVar('REDIS_DATABASE', 'string'),
    auth,
    servers: validateEnvVar('REDIS_SERVERS', 'string'),
    isCluster: validateEnvVar('REDIS_IS_CLUSTER', 'boolean'),
  };
};
