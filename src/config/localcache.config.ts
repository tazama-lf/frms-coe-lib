import { validateEnvVar } from '.';
import { type ManagerConfig } from '../services/dbManager';

/**
 * Validates and retrieves the Local cache options configuration from environment variables.
 *
 * @returns {LocalCacheConfig} - The validated LocalCacheConfig configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const localCacheOptions = validateLocalCacheConfig();
 */
let _localCacheConfig: ManagerConfig = {};

export const validateLocalCacheConfig = (): ManagerConfig => {
  _localCacheConfig = {
    localCacheConfig: {
      localCacheEnabled: validateEnvVar('LOCAL_CACHE_ENABLED', 'boolean', true),
      localCacheTTL: validateEnvVar('LOCAL_CACHETTL', 'number', true),
    },
  };

  return {
    ..._localCacheConfig,
  };
};

export const localCacheConfig = _localCacheConfig;
