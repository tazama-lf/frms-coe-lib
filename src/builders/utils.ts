import type { QueryConfig } from 'pg';
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
