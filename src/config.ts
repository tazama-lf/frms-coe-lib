import path from 'path';
import { config as dotenv } from 'dotenv';

export interface IConfig {
  functionName: string;
  logger: {
    logstashHost: string;
    logstashPort: number;
  };
  apmLogging: boolean;
  apmSecretToken: string;
  ruleVersion: string;
  nodeEnv: string;
}

// Load .env file into process.env if it exists. This is convenient for running locally.
dotenv({
  path: path.resolve(__dirname, '../.env'),
});

export const config: IConfig = {
  functionName: process.env.FUNCTION_NAME as string,
  logger: {
    logstashHost: process.env.LOGSTASH_HOST as string,
    logstashPort: parseInt(process.env.LOGSTASH_PORT ?? '0', 10),
  },
  apmLogging: process.env.APM_LOGGING === 'true',
  apmSecretToken: process.env.APM_SECRET_TOKEN as string,
  ruleVersion: process.env.RULE_VERSION as string,
  nodeEnv: process.env.NODE_ENV as string,
};
