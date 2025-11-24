// SPDX-License-Identifier: Apache-2.0

import * as util from 'node:util';
import { Pool, type PoolConfig } from 'pg';
import { isDatabaseReady } from '../builders/utils';
import type { Pacs002, Pacs008, Pain001, Pain013 } from '../interfaces';
import type { PgQueryConfig } from '../interfaces/database';
import { readyChecks, type DBConfig, type RawHistoryDB } from '../services/dbManager';
import { getSSLConfig } from './utils';

export async function rawHistoryBuilder(manager: RawHistoryDB, rawHistoryConfig: DBConfig): Promise<void> {
  const conf: PoolConfig = {
    host: rawHistoryConfig.host,
    port: rawHistoryConfig.port,
    database: rawHistoryConfig.databaseName,
    user: rawHistoryConfig.user,
    password: rawHistoryConfig.password,
    ssl: getSSLConfig(rawHistoryConfig.certPath),
  } as const;

  manager._rawHistory = new Pool(conf);

  try {
    const dbReady = await isDatabaseReady(manager._rawHistory);
    readyChecks.RawHistoryDB = dbReady ? 'Ok' : 'err';
  } catch (error) {
    const err = error as Error;
    readyChecks.RawHistoryDB = `err, ${util.inspect(err)}`;
  }

  manager.getTransactionPacs008 = async (endToEndId: string, tenantId: string): Promise<Pacs008 | undefined> => {
    const client = await manager._rawHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);

      const query: PgQueryConfig = {
        text: 'SELECT document FROM pacs008 WHERE endToEndId = $1 AND tenantId = $2',
        values: [endToEndId, tenantId],
      };

      const queryRes = await client.query<{ document: Pacs008 }>(query);
      await client.query('COMMIT');

      const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].document : undefined;
      return toReturn;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveTransactionHistoryPain001 = async (tran: Pain001): Promise<void> => {
    const client = await manager._rawHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tran.TenantId]);

      const query: PgQueryConfig = {
        text: 'INSERT INTO pain001 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
        values: [tran],
      };
      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveTransactionHistoryPain013 = async (tran: Pain013): Promise<void> => {
    const client = await manager._rawHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tran.TenantId]);

      const query: PgQueryConfig = {
        text: 'INSERT INTO pain013 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
        values: [tran],
      };
      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveTransactionHistoryPacs008 = async (tran: Pacs008): Promise<void> => {
    const client = await manager._rawHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tran.TenantId]);

      const query: PgQueryConfig = {
        text: 'INSERT INTO pacs008 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
        values: [tran],
      };
      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveTransactionHistoryPacs002 = async (tran: Pacs002): Promise<void> => {
    const client = await manager._rawHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tran.TenantId]);

      const query: PgQueryConfig = {
        text: 'INSERT INTO pacs002 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
        values: [tran],
      };
      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };
}
