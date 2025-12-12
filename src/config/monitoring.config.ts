import { validateEnvVar } from '.';

/**
 * Interface representing the configuration for APM (Application Performance Monitoring).
 */
export interface ApmConfig {
  /** Indicates whether APM is active. */
  apmActive: boolean;

  /** The name of the APM service. */
  apmServiceName: string;

  /** The URL for the APM server. */
  apmUrl: string;

  /** The secret token for APM authentication. */
  apmSecretToken: string;
}

/**
 * Interface representing the configuration for logging.
 */
export interface LogConfig {
  /** The host of the logging sidecar. */
  sidecarHost?: string;
  logLevel: string;
  pinoElasticOpts?: {
    flushBytes: number;
    elasticUsername: string;
    elasticPassword: string;
    elasticHost: string;
    elasticIndex: string;
    elasticVersion: number;
  };
}

/**
 * Validates and retrieves the APM configuration from environment variables.
 *
 * @returns {ApmConfig} - The validated APM configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const apmConfig = validateAPMConfig();
 */
export const validateAPMConfig = (): ApmConfig => ({
  apmActive: Boolean(validateEnvVar('APM_ACTIVE', 'boolean')),
  apmServiceName: validateEnvVar('APM_SERVICE_NAME', 'string').toString(),
  apmSecretToken: validateEnvVar('APM_SECRET_TOKEN', 'string', true).toString(),
  apmUrl: validateEnvVar('APM_URL', 'string').toString(),
});

/**
 * Validates and retrieves the logging configuration from environment variables.
 *
 * @returns {LogConfig} - The validated logging configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const logConfig = validateLogConfig();
 */
export const validateLogConfig = (): LogConfig => ({
  sidecarHost: validateEnvVar('SIDECAR_HOST', 'string', true).toString(),
  logLevel: validateEnvVar('LOG_LEVEL', 'string', true).toString() || 'info',
  pinoElasticOpts: {
    flushBytes: Number(validateEnvVar('ELASTIC_FLUSH_BYTES', 'number', true)),
    elasticUsername: validateEnvVar('ELASTIC_USERNAME', 'string', true).toString(),
    elasticPassword: validateEnvVar('ELASTIC_PASSWORD', 'string', true).toString(),
    elasticHost: validateEnvVar('ELASTIC_HOST', 'string', true).toString(),
    elasticIndex: validateEnvVar('ELASTIC_INDEX', 'string', true).toString(),
    elasticVersion: Number(validateEnvVar('ELASTIC_SEARCH_VERSION', 'number', true)),
  },
});
