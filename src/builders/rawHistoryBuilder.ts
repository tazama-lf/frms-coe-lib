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

  manager.getTransactionPacs008 = async (endToEndId: string): Promise<Pacs008 | undefined> => {
    const query: PgQueryConfig = {
      text: `SELECT 
              document 
            FROM 
              pacs008 
            WHERE 
              endToEndId = $1`,
      values: [endToEndId],
    };

    const queryRes = await manager._rawHistory.query<{ document: Pacs008 }>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].document : undefined;

    return toReturn;
  };

  manager.saveTransactionHistoryPain001 = async (tran: Pain001): Promise<void> => {
    const query: PgQueryConfig = {
      text: `INSERT INTO pain001
              (document)
            VALUES
              ($1)
            ON CONFLICT 
              (EndToEndId) DO NOTHING`,
      values: [tran],
    };

    await manager._rawHistory.query(query);
  };

  manager.saveTransactionHistoryPain013 = async (tran: Pain013): Promise<void> => {
    const query: PgQueryConfig = {
      text: `INSERT INTO pain013
              (document)
            VALUES
              ($1)
            ON CONFLICT 
              (EndToEndId) DO NOTHING`,
      values: [tran],
    };

    await manager._rawHistory.query(query);
  };

  manager.saveTransactionHistoryPacs008 = async (tran: Pacs008): Promise<void> => {
    const query: PgQueryConfig = {
      text: `INSERT INTO pacs008
              (document)
            VALUES
              ($1)
            ON CONFLICT 
              (EndToEndId) DO NOTHING`,
      values: [tran],
    };

    await manager._rawHistory.query(query);
  };

  manager.saveTransactionHistoryPacs002 = async (tran: Pacs002): Promise<void> => {
    const query: PgQueryConfig = {
      text: `INSERT INTO pacs002
              (document)
            VALUES
              ($1)
            ON CONFLICT 
              (EndToEndId) DO NOTHING`,
      values: [tran],
    };

    await manager._rawHistory.query(query);
  };
}
