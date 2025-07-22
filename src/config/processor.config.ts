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

export interface AdditionalConfig {
  name: string;
  type: 'string' | 'boolean' | 'number';
  optional?: boolean;
}

/**
 * Validates and retrieves the processor configuration from environment variables.
 *
 * @returns {ProcessorConfig} - The validated processor configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const processorConfig = validateProcessorConfig(additionalEnvironmentVariables?: additionalConfig[]);
 */

export const validateProcessorConfig = (additionalEnvironmentVariables?: AdditionalConfig[]): ProcessorConfig => {
  //Additional Environment variables
  const valueAndVariablesName = additionalEnvironmentVariables?.map((value) => ({
    value: validateEnvVar(value.name, value.type, value.optional),
    name: value.name,
  }));

  // reduce array of object to object of config
  const _additionalConfiguration = valueAndVariablesName?.reduce<Record<string, string | number | boolean>>((acc, item) => {
    acc[item.name] = item.value;
    return acc;
  }, {});

  const nodeEnv = validateEnvVar('NODE_ENV', 'string');

  if (nodeEnv !== 'dev' && nodeEnv !== 'production' && nodeEnv !== 'test') {
    throw new Error('Environment variable NODE_ENV is not valid. Expected "dev", "production" or "test".');
  }

  const maxCPU = process.env.MAX_CPU ?? '1';

  if (isNaN(Number(maxCPU))) {
    throw new Error('The value specified for MAX_CPU is not a number.');
  }

  const _processorConfig: ProcessorConfig = {
    maxCPU: parseInt(maxCPU, 10),
    functionName: validateEnvVar('FUNCTION_NAME', 'string').toString(),
    nodeEnv,
  };
  return { ..._processorConfig, ..._additionalConfiguration };
};
