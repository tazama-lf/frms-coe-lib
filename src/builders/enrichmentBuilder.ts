// SPDX-License-Identifier: Apache-2.0

import * as util from 'node:util';
import { Pool, type PoolConfig } from 'pg';
import { isDatabaseReady } from '../builders/utils';
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

  manager.saveEnrichmentData = async (id: string, data: Record<string, unknown>): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO enrichment (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
      values: [id, data],
    };

    await manager._enrichment.query(query);
  };

  manager.getEnrichmentData = async (id: string): Promise<Record<string, unknown> | undefined> => {
    const query: PgQueryConfig = {
      text: 'SELECT data FROM enrichment WHERE id = $1',
      values: [id],
    };

    const queryRes = await manager._enrichment.query<{ data: Record<string, unknown> }>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].data : undefined;

    return toReturn;
  };

  manager.ingestData = async (text: string, values: unknown[] = []): Promise<void> => {
    const query: PgQueryConfig = {
      text,
      values,
    };

    await manager._enrichment.query(query);
  };

  manager.createTable = async (tableName: string): Promise<void> => {
    const createQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
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
    const query: PgQueryConfig = {
      text: `
       DELETE FROM ${tableName};
      `,
      values: [],
    };

    await manager._enrichment.query(query);
  };
}
