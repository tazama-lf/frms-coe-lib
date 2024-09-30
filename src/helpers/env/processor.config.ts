import { validateEnvVar } from '.';

export interface ProcessorConfig {
  maxCPU: number;
  functionName: string;
  nodeEnv: string;
}

export const validateProcessorConfig = (): ProcessorConfig => {
  const nodeEnv = validateEnvVar('NODE_ENV', 'string');
  if (nodeEnv !== 'dev' && nodeEnv !== 'production' && nodeEnv !== 'test') {
    throw new Error('Environment variable NODE_ENV is not valid. Expected "dev", "production" or "test"');
  }

  const maxCPU = process.env.MAX_CPU;

  if (maxCPU == null || isNaN(Number(maxCPU))) {
    throw new Error('The value specified for MAX_CPU is not a number');
  }

  return {
    maxCPU: parseInt(process.env.MAX_CPU ?? '1'),
    functionName: validateEnvVar('FUNCTION_NAME', 'string'),
    nodeEnv,
  };
};
