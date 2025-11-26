import { validateEnvVar } from '.';
import type { ManagerConfig } from '../services/dbManager';

/**
 * Enum representing different database types.
 *
 * @enum {number}
 */
export enum Database {
  /** Database for storing event history. */
  EVENT_HISTORY = 'eventHistory',

  /** Database for raw history. */
  RAW_HISTORY = 'rawHistory',

  /** Database for configuration settings. */
  CONFIGURATION = 'configuration',

  /** Database for evaluations. */
  EVALUATION = 'evaluation',
}

const DEFAULT_DATABASE_PORT = 5432;

/**
 * Validates and retrieves the Redis configuration for a specified database type.
 *
 * @param {boolean} authEnabled - Indicates whether authentication is enabled.
 * @param {Database} database - The type of database for which to retrieve the configuration.
 * @returns {DbConfig} - The validated database configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const rawHistoryConfig = validateDatabaseConfig(true, Database.RAW_HISTORY);
 */
export const validateDatabaseConfig = (authEnabled: boolean, database: Database): ManagerConfig => {
  let prefix = '';

  switch (database) {
    case Database.EVENT_HISTORY:
      prefix = 'EVENT_HISTORY_DATABASE';
      break;
    case Database.RAW_HISTORY:
      prefix = 'RAW_HISTORY_DATABASE';
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
      host: validateEnvVar(`${prefix}_HOST`, 'string').toString(),
      port: Number(validateEnvVar(`${prefix}_PORT`, 'number', true)) || DEFAULT_DATABASE_PORT,
      user,
      certPath: validateEnvVar(`${prefix}_CERT_PATH`, 'string', true).toString(),
    },
  };
  return result;
};
