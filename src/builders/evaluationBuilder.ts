// SPDX-License-Identifier: Apache-2.0

import * as util from 'node:util';
import { Pool, type PoolConfig } from 'pg';
import { isDatabaseReady } from '../builders/utils';
import type { DataCache, NetworkMap, Pacs002 } from '../interfaces';
import type { PgQueryConfig } from '../interfaces/database';
import type { Alert } from '../interfaces/processor-files/Alert';
import type { Evaluation } from '../interfaces/processor-files/TADPReport';
import { type DBConfig, type EvaluationDB, readyChecks } from '../services/dbManager';
import { getSSLConfig } from './utils';

export async function evaluationBuilder(manager: EvaluationDB, evaluationConfig: DBConfig): Promise<void> {
  const conf: PoolConfig = {
    host: evaluationConfig.host,
    port: evaluationConfig.port,
    database: evaluationConfig.databaseName,
    user: evaluationConfig.user,
    password: evaluationConfig.password,
    ssl: getSSLConfig(evaluationConfig.certPath),
  } as const;

  manager._evaluation = new Pool(conf);

  try {
    const dbReady = await isDatabaseReady(manager._evaluation);
    readyChecks.EvaluationDB = dbReady ? 'Ok' : 'err';
  } catch (err) {
    readyChecks.EvaluationDB = `err, ${util.inspect(err)}`;
  }

  manager.getReportByMessageId = async (messageid: string, tenantId: string): Promise<Evaluation | undefined> => {
    const client = await manager._evaluation.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);

      const query: PgQueryConfig = {
        text: 'SELECT evaluation FROM evaluation WHERE messageId = $1',
        values: [messageid],
      };

      const queryRes = await client.query<{ evaluation: Evaluation }>(query);
      await client.query('COMMIT');
      const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].evaluation : undefined;

      return toReturn;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveEvaluationResult = async (
    transactionID: string,
    transaction: Pacs002,
    networkMap: NetworkMap,
    alert: Alert,
    dataCache?: DataCache,
  ): Promise<void> => {
    const data: Evaluation = {
      transactionID,
      transaction,
      networkMap,
      report: alert,
      dataCache,
    };
    const client = await manager._evaluation.connect();
    await client.query('BEGIN');
    await client.query('SELECT public.set_tenant_id($1)', [transaction.TenantId]);

    try {
      const query: PgQueryConfig = {
        text: 'INSERT INTO evaluation (evaluation) VALUES ($1) ON CONFLICT (messageId, tenantId) DO NOTHING',
        values: [data],
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
