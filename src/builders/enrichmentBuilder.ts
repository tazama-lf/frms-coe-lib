// SPDX-License-Identifier: Apache-2.0

import * as util from 'node:util';
import { Pool, type PoolConfig } from 'pg';
import { isDatabaseReady, validateTableName } from '../builders/utils';
import type { PgQueryConfig } from '../interfaces/database';
import { type DBConfig, type EnrichmentDB, readyChecks } from '../services/dbManager';
import { getSSLConfig } from './utils';

export async function enrichmentBuilder(manager: EnrichmentDB, enrichmentConfig: DBConfig): Promise<void> {
  const conf: PoolConfig = {
    host: enrichmentConfig.host,
    port: enrichmentConfig.port,
    database: enrichmentConfig.databaseName,
    user: enrichmentConfig.user,
    password: enrichmentConfig.password,
    ssl: getSSLConfig(enrichmentConfig.certPath),
  } as const;

  manager._enrichment = new Pool(conf);

  try {
    const dbReady = await isDatabaseReady(manager._enrichment);
    readyChecks.EnrichmentDB = dbReady ? 'Ok' : 'err';
  } catch (err) {
    readyChecks.EnrichmentDB = `err, ${util.inspect(err)}`;
  }

  manager.ingestData = async (text: string, values: unknown[] = []): Promise<void> => {
    const query: PgQueryConfig = {
      text,
      values,
    };

    await manager._enrichment.query(query);
  };

  manager.createTable = async (tableName: string): Promise<void> => {
    // Validate table name to prevent SQL injection
    const validatedTableName = validateTableName(tableName);

    const createQuery = `
        CREATE TABLE IF NOT EXISTS ${validatedTableName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          data JSONB NOT NULL,
          job_id TEXT NOT NULL,
          checksum TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `;

    const query: PgQueryConfig = {
      text: createQuery,
      values: [],
    };

    await manager._enrichment.query(query);
  };

  manager.deleteRows = async (tableName: string): Promise<void> => {
    // Validate table name to prevent SQL injection
    const validatedTableName = validateTableName(tableName);

    const query: PgQueryConfig = {
      text: `
       DELETE FROM ${validatedTableName};
      `,
      values: [],
    };

    await manager._enrichment.query(query);
  };
}
