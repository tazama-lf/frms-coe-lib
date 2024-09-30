import { validateEnvVar } from '.';

export enum Database {
  PSEUDONYMS,
  TRANSACTION_HISTORY,
  CONFIGURATION,
  TRANSACTION,
  EVALUATION,
}

export interface DatabaseConfig {
  name: string;
  password?: string;
  url: string;
  user: string;
  certPath: string;
}

export const validateRedisConfig = (authEnabled: boolean, database: Database): DatabaseConfig => {
  let prefix = 'TRANASCTION_HISTORY_DATABASE';

  switch (database) {
    case Database.PSEUDONYMS: {
      prefix = 'PSEUDONYMS_DATABASE';
      break;
    }
    case Database.TRANSACTION_HISTORY: {
      prefix = 'TRANSACTION_HISTORY_DATABASE';
      break;
    }
    case Database.CONFIGURATION: {
      prefix = 'CONFIGURATION_DATABASE';
      break;
    }
    case Database.TRANSACTION: {
      prefix = 'TRANSACTION_DATABASE';
      break;
    }
    case Database.EVALUATION: {
      prefix = 'EVALUATION_DATABASE';
      break;
    }
  }

  let auth: string | undefined;

  if (authEnabled) {
    auth = validateEnvVar(`${prefix}_PASSWORD`, 'string');
  }

  return {
    name: validateEnvVar(prefix, 'string'),
    password: auth,
    url: validateEnvVar(`${prefix}_URL`, 'string'),
    user: validateEnvVar(`${prefix}_USER`, 'string'),
    certPath: validateEnvVar(`${prefix}_CERT_PATH`, 'string'),
  };
};
