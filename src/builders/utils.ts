import type { Pool, QueryConfig } from 'pg';
import * as fs from 'node:fs';
import type { ConnectionOptions } from 'node:tls';

/**
 *  Based on Postgres QueryConfig to assist with postgres's query(queryConfig: PgQueryConfig)
 *
 * @interface
 */
export interface PgQueryConfig extends QueryConfig {
  text: string;
  values: unknown[];
}

/**
 * Given a certificate path provide database ssl connection options if cert is found
 *
 * @param {string} certPath
 * @returns {(ConnectionOptions | false)}
 */
export const getSSLConfig = (certPath: string): ConnectionOptions | false => {
  if (!fs.existsSync(certPath)) return false;

  return {
    // rejectUnauthorized: false,
    ca: [fs.readFileSync(certPath).toString()],
  };
};

export const isDatabaseReady = async (db: Pool): Promise<boolean> => {
  const client = await db.connect();
  await client.query('SELECT 1');
  client.release();
  return true;
};

/**
 * Validates a table name to prevent SQL injection attacks.
 * Table names must start with a letter or underscore, followed by letters, digits, or underscores,
 * and cannot exceed 63 characters (PostgreSQL identifier limit).
 *
 * @param {string} tableName - The table name to validate
 * @throws {Error} If the table name is invalid
 * @returns {string} The validated table name
 */
export const validateTableName = (tableName: string): string => {
  const TABLE_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/;

  if (!tableName) {
    throw new Error('Table name cannot be empty');
  }

  if (!TABLE_NAME_PATTERN.test(tableName)) {
    throw new Error(
      `Invalid table name: '${tableName}'. Table names must start with a letter or underscore, ` +
        'contain only letters, digits, and underscores, and be 63 characters or less.',
    );
  }

  return tableName;
};
