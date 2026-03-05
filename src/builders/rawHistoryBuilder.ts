// SPDX-License-Identifier: Apache-2.0

import * as util from 'node:util';
import { Pool, type PoolConfig } from 'pg';
import { isDatabaseReady } from '../builders/utils';
import type { Pacs002, Pacs008, Pain001, Pain013 } from '../interfaces';
import type { PgQueryConfig } from '../interfaces/database';
import type { QuarantineRecord, trackedFields } from '../interfaces/database/RawHistoryDB';

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
    const query: PgQueryConfig = {
      text: 'SELECT document FROM pacs008 WHERE endToEndId = $1 AND tenantId = $2',
      values: [endToEndId, tenantId],
    };

    const queryRes = await manager._rawHistory.query<{ document: Pacs008 }>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].document : undefined;

    return toReturn;
  };

  manager.getTransactionAny = async (
    endToEndId: string,
    tenantId: string,
    tableName: string,
  ): Promise<Record<string, unknown> | undefined> => {
    // figthing against sqlI
    if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(tableName)) {
      throw new Error(
        `Invalid table name format: ${tableName}. Table names must start with a letter or underscore and contain only letters, digits, and underscores (max 63 characters).`,
      );
    }

    //  Whitelist of known transaction table names - this cant be done because infinite list
    // const allowedTableNames = [
    //   'pain001', 'pain013', 'pacs008', 'pacs002',
    //   'iso20022_pain_001_001_11', 'iso20022_pain_013_001_09',
    //   'iso20022_pacs_008_001_10', 'iso20022_pacs_002_001_12'
    // ];

    // if (!allowedTableNames.includes(tableName)) {
    //   throw new Error(`Access denied: Table '${tableName}' is not in the allowed list of transaction tables.`);
    // }

    const query: PgQueryConfig = {
      text: `SELECT document FROM ${tableName} WHERE endToEndId = $1 AND tenantId = $2`,
      values: [endToEndId.trim(), tenantId.trim()],
    };

    //disable any eslintng for this line because we have already validated the table name and this is the only way to do it
    const queryRes = await manager._rawHistory.query<{ document: Record<string, unknown> }>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].document : undefined;

    return toReturn;
  };

  manager.saveTransactionHistoryPain001 = async (tran: Pain001): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO pain001 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
      values: [tran],
    };

    await manager._rawHistory.query(query);
  };

  manager.saveDynamicTransactionHistory = async (
    tableName: string,
    tran: Record<string, unknown>,
    trackedFields?: trackedFields,
  ): Promise<void> => {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(tableName)) {
      throw new Error(
        `Invalid table name format: ${tableName}. Table names must start with a letter or underscore and contain only letters, digits, and underscores (max 63 characters).`,
      );
    }

    const randomMessageId = `msg-${Math.random().toString(36).substring(2, 15)}`;

    const query: PgQueryConfig = {
      text: `INSERT INTO ${tableName} (document, credttm, messageid, endtoendid, debtoraccountid, creditoraccountid, tenantid) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      values: [
        tran,
        trackedFields?.CreDtTm ?? '',
        trackedFields?.MsgId ?? randomMessageId,
        trackedFields?.EndToEndId ?? '',
        trackedFields?.dbtrAcctId ?? null,
        trackedFields?.cdtrAcctId ?? null,
        trackedFields?.TenantId ?? '',
      ],
    };

    await manager._rawHistory.query(query);
  };

  // need to add one more function here
  manager.saveToQuarantine = async (record: QuarantineRecord): Promise<void> => {
    const quarantineQuery: PgQueryConfig = {
      text: 'INSERT INTO dems_quarantine (id, correlation_id, tenant_id, endpoint_path, config_id, version, error, raw_payload, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      values: [
        record.id,
        record.correlation_id,
        record.tenant_id,
        record.endpoint_path,
        record.config_id,
        record.version,
        record.error,
        record.raw_payload,
        record.status,
      ],
    };

    await manager._rawHistory.query(quarantineQuery);
  };

  manager.saveTransactionHistoryPain013 = async (tran: Pain013): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO pain013 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
      values: [tran],
    };

    await manager._rawHistory.query(query);
  };

  manager.saveTransactionHistoryPacs008 = async (tran: Pacs008): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO pacs008 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
      values: [tran],
    };

    await manager._rawHistory.query(query);
  };

  manager.saveTransactionHistoryPacs002 = async (tran: Pacs002): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO pacs002 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
      values: [tran],
    };

    await manager._rawHistory.query(query);
  };
}
