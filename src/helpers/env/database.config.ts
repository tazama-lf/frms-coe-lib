import { validateEnvVar } from '.';

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
 * Interface representing the configuration for a database connection.
 */
export interface DatabaseConfig {
  /** The name of the database. */
  name: string;

  /** The password for the database (optional). */
  password?: string;

  /** The URL for the database connection. */
  url: string;

  /** The username for the database connection. */
  user: string;

  /** The path to the certificate for secure connections. */
  certPath: string;
}

/**
 * Validates and retrieves the Redis configuration for a specified database type.
 *
 * @param {boolean} authEnabled - Indicates whether authentication is enabled.
 * @param {Database} database - The type of database for which to retrieve the configuration.
 * @returns {DatabaseConfig} - The validated database configuration.
 * @throws {Error} - Throws an error if required environment variables are not defined or invalid.
 *
 * @example
 * const transactionHistoryConfig = validateDatabaseConfig(true, Database.TRANSACTION_HISTORY);
 */
export const validateDatabaseConfig = (authEnabled: boolean, database: Database): DatabaseConfig => {
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
