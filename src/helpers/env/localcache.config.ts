import { validateEnvVar } from '.';
import { type LocalCacheConfig } from '../../services/dbManager';

/**
 * Validates and retrieves the Local cache options configuration from environment variables.
 *
 * @returns {LocalCacheConfig} - The validated LocalCacheConfig configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const localCacheOptions = validateLocalCacheConfig();
 */
export const validateLocalCacheConfig = (): LocalCacheConfig => {
  return {
    localCacheEnabled: validateEnvVar('LOCAL_CACHE_ENABLED', 'boolean', true),
    localCacheTTL: validateEnvVar('LOCAL_CACHETTL', 'number', true),
  };
};
