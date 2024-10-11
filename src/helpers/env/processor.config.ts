import { validateEnvVar } from '.';

/**
 * Interface representing the configuration for a processor.
 */
export interface ProcessorConfig {
  /** The maximum CPU allocation for the processor. */
  maxCPU: number;

  /** The name of the function to be processed. */
  functionName: string;

  /** The environment in which the application is running. */
  nodeEnv: string;
}

/**
 * Validates and retrieves the processor configuration from environment variables.
 *
 * @returns {ProcessorConfig} - The validated processor configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const processorConfig = validateProcessorConfig();
 */
export const validateProcessorConfig = (): ProcessorConfig => {
  const nodeEnv = validateEnvVar('NODE_ENV', 'string');

  if (nodeEnv !== 'dev' && nodeEnv !== 'production' && nodeEnv !== 'test') {
    throw new Error('Environment variable NODE_ENV is not valid. Expected "dev", "production" or "test".');
  }

  const maxCPU = process.env.MAX_CPU;

  if (maxCPU == null || isNaN(Number(maxCPU))) {
    throw new Error('The value specified for MAX_CPU is not a number.');
  }

  return {
    maxCPU: parseInt(maxCPU, 10),
    functionName: validateEnvVar('FUNCTION_NAME', 'string'),
    nodeEnv,
  };
};
