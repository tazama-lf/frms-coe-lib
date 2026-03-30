// SPDX-License-Identifier: Apache-2.0

import * as util from 'node:util';
import { Pool, type PoolConfig } from 'pg';
import pgFormat from 'pg-format';
import { isDatabaseReady } from '../builders/utils';
import type { Pacs002, Pacs008, Pain001, Pain013 } from '../interfaces';
import type { PgQueryConfig } from '../interfaces/database';
import { readyChecks, type DBConfig, type RawHistoryDB } from '../services/dbManager';
import { getSSLConfig } from './utils';
import type { QuarantineRecord } from '../interfaces/DEMS/QuarantineRecord';
import type { TrackedFields } from '../interfaces/DEMS/TrackedFields';

const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB

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

  manager.saveTransactionHistoryPain001 = async (tran: Pain001): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO pain001 (document) VALUES ($1) ON CONFLICT (EndToEndId, tenantId) DO NOTHING',
      values: [tran],
    };

    await manager._rawHistory.query(query);
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

  // ---------------------

  manager.saveToQuarantine = async (record: QuarantineRecord): Promise<void> => {
    let payload = record.raw_payload;

    if (payload.length > MAX_PAYLOAD_SIZE) {
      payload = payload.substring(0, MAX_PAYLOAD_SIZE) + '... [truncated]';
    }

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
        payload,
        record.status,
      ],
    };

    await manager._rawHistory.query(quarantineQuery);
  };

  manager.saveDynamicTransactionHistory = async (
    tableName: string,
    tran: Record<string, unknown>,
    trackedFields?: TrackedFields,
  ): Promise<void> => {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(tableName)) {
      throw new Error(
        `Invalid table name format: ${tableName}. Table names must start with a letter or underscore and contain only letters, digits, and underscores (max 63 characters).`,
      );
    }

    if (!trackedFields?.TenantId) {
      throw new Error('TenantId is required for transaction history - essential for data isolation');
    }

    if (!trackedFields?.CreDtTm) {
      throw new Error('CreDtTm (creation date/time) is required for transaction history - essential for audit trail');
    }

    const randomMessageId = `msg-${Math.random().toString(36).substring(2, 15)}`;

    const query: PgQueryConfig = {
      text: pgFormat(
        'INSERT INTO %I (document, credttm, messageid, endtoendid, debtoraccountid, creditoraccountid, tenantid) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        tableName,
      ),
      values: [
        tran,
        trackedFields.CreDtTm,
        trackedFields.MsgId ?? randomMessageId,
        trackedFields.EndToEndId?.trim() ?? trackedFields.MsgId?.trim(),
        trackedFields.dbtrAcctId ?? null,
        trackedFields.cdtrAcctId ?? null,
        trackedFields.TenantId.trim(),
      ],
    };

    await manager._rawHistory.query(query);
  };

  manager.getTransactionAny = async (
    endToEndId: string,
    tenantId: string,
    tableName: string,
  ): Promise<Record<string, unknown> | undefined> => {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(tableName)) {
      throw new Error(
        `Invalid table name format: ${tableName}. Table names must start with a letter or underscore and contain only letters, digits, and underscores (max 63 characters).`,
      );
    }

    const query: PgQueryConfig = {
      text: pgFormat('SELECT document FROM %I WHERE endToEndId = $1 AND tenantId = $2', tableName),
      values: [endToEndId.trim(), tenantId.trim()],
    };

    const queryRes = await manager._rawHistory.query<{ document: Record<string, unknown> }>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].document : undefined;

    return toReturn;
  };
}
