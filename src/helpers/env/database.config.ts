import { validateEnvVar } from '.';
import { type DBConfig } from '../../services/dbManager';

/**
 * Enum representing different database types.
 *
 * @enum {number}
 */
export enum Database {
  /** Database for storing pseudonyms. */
  PSEUDONYMS,

  /** Database for transaction history. */
  TRANSACTION_HISTORY,

  /** Database for configuration settings. */
  CONFIGURATION,

  /** Database for individual transactions. */
  TRANSACTION,

  /** Database for evaluations. */
  EVALUATION,
}

/**
 * Validates and retrieves the Redis configuration for a specified database type.
 *
 * @param {boolean} authEnabled - Indicates whether authentication is enabled.
 * @param {Database} database - The type of database for which to retrieve the configuration.
 * @returns {DbConfig} - The validated database configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const transactionHistoryConfig = validateDatabaseConfig(true, Database.TRANSACTION_HISTORY);
 */
export const validateDatabaseConfig = (authEnabled: boolean, database: Database): DBConfig => {
  let prefix = 'TRANSACTION_HISTORY_DATABASE';

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

  const password = validateEnvVar<string>(`${prefix}_PASSWORD`, 'string', !authEnabled);
  const user = validateEnvVar<string>(`${prefix}_USER`, 'string', !authEnabled);

  return {
    databaseName: validateEnvVar(prefix, 'string'),
    password,
    url: validateEnvVar(`${prefix}_URL`, 'string'),
    user,
    certPath: validateEnvVar(`${prefix}_CERT_PATH`, 'string'),
    localCacheTTL: validateEnvVar<number>('CACHETTL', 'number', true),
    localCacheEnabled: validateEnvVar<boolean>('CACHE_ENABLED', 'boolean', true),
  };
};
