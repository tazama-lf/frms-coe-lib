import { validateEnvVar } from '.';
import type { OpenSearchConfig } from '../interfaces/openSearch';

/**
 * Validates and retrieves the OpenSearch configuration from environment variables.
 *
 * @returns {OpenSearchConfig} - The validated OpenSearch configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const openSearchConfig = openSearchConfig();
 */
export const openSearchConfig = (): OpenSearchConfig => {
  const node = validateEnvVar('OPENSEARCH_NODE', 'string', true).toString();
  const username = validateEnvVar('OPENSEARCH_USERNAME', 'string', false)?.toString();
  const password = validateEnvVar('OPENSEARCH_PASSWORD', 'string', false)?.toString();
  const rejectUnauthorized = validateEnvVar('OPENSEARCH_SSL_REJECT_UNAUTHORIZED', 'boolean', true);

  return {
    node,
    auth:
      username && password
        ? {
            username,
            password,
          }
        : undefined,
    ssl: {
      rejectUnauthorized: Boolean(rejectUnauthorized),
    },
    indexPrefix: 'audit-logs',
  };
};
