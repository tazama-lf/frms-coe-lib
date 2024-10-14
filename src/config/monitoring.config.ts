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
export const validateAPMConfig = (): ApmConfig => {
  return {
    apmActive: validateEnvVar('APM_ACTIVE', 'boolean'),
    apmServiceName: validateEnvVar('APM_SERVICE_NAME', 'string'),
    apmSecretToken: validateEnvVar('APM_SECRET_TOKEN', 'string', true),
    apmUrl: validateEnvVar('APM_URL', 'string'),
  };
};

/**
 * Validates and retrieves the logging configuration from environment variables.
 *
 * @returns {LogConfig} - The validated logging configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const logConfig = validateLogConfig();
 */
export const validateLogConfig = (): LogConfig => {
  return {
    sidecarHost: validateEnvVar('SIDECAR_HOST', 'string', true),
  };
};
