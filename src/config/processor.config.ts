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

export interface additionalConfig {
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
let _processorConfigObject: ProcessorConfig = {
  maxCPU: 0,
  functionName: '',
  nodeEnv: '',
};

let _configuration: Record<string, string | number | boolean> | undefined;

export const validateProcessorConfig = (additionalEnvironmentVariables?: additionalConfig[]): ProcessorConfig => {
  //Additional Environment variables
  const valueAndVariablesName = additionalEnvironmentVariables?.map((value) => {
    console.log(value.optional);
    return { value: validateEnvVar<string>(value.name, value.type, value.optional), name: value.name };
  });

  // reduce array of object to object of config
  _configuration = valueAndVariablesName?.reduce<Record<string, string | number | boolean>>((acc, item) => {
    acc[item.name] = item.value;
    return acc;
  }, {});

  const nodeEnv = validateEnvVar('NODE_ENV', 'string');

  if (nodeEnv !== 'dev' && nodeEnv !== 'production' && nodeEnv !== 'test') {
    throw new Error('Environment variable NODE_ENV is not valid. Expected "dev", "production" or "test".');
  }

  const maxCPU = process.env.MAX_CPU;

  if (maxCPU == null || isNaN(Number(maxCPU))) {
    throw new Error('The value specified for MAX_CPU is not a number.');
  }

  _processorConfigObject = {
    maxCPU: parseInt(maxCPU, 10),
    functionName: validateEnvVar('FUNCTION_NAME', 'string'),
    nodeEnv,
  };
  return { ..._processorConfigObject, ..._configuration };
};

export const processorConfig = { ..._processorConfigObject, ..._configuration };
