import { validateEnvVar } from '.';
import type { ManagerConfig } from '../services/dbManager';

/**
 * Enum representing different database types.
 *
 * @enum {number}
 */
export enum Database {
  /** Database for storing pseudonyms. */
  PSEUDONYMS = 'pseudonyms',

  /** Database for transaction history. */
  TRANSACTION_HISTORY = 'transactionHistory',

  /** Database for configuration settings. */
  CONFIGURATION = 'configuration',

  /** Database for evaluations. */
  EVALUATION = 'transaction',
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
export const validateDatabaseConfig = (authEnabled: boolean, database: Database): ManagerConfig => {
  let prefix = '';

  switch (database) {
    case Database.PSEUDONYMS:
      prefix = 'PSEUDONYMS_DATABASE';
      break;
    case Database.TRANSACTION_HISTORY:
      prefix = 'TRANSACTION_HISTORY_DATABASE';
      break;
    case Database.CONFIGURATION:
      prefix = 'CONFIGURATION_DATABASE';
      break;
    case Database.EVALUATION:
      prefix = 'EVALUATION_DATABASE';
      break;
  }

  const password = validateEnvVar(`${prefix}_PASSWORD`, 'string', !authEnabled).toString();
  const user = validateEnvVar(`${prefix}_USER`, 'string', !authEnabled).toString();

  const result: ManagerConfig = {
    [database]: {
      databaseName: validateEnvVar(prefix, 'string').toString(),
      password,
      url: validateEnvVar(`${prefix}_URL`, 'string').toString(),
      user,
      certPath: validateEnvVar(`${prefix}_CERT_PATH`, 'string', true).toString(),
    },
  };
  return result;
};
