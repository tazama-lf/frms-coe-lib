// SPDX-License-Identifier: Apache-2.0

import * as fs from 'node:fs';
import { Pool, type PoolConfig } from 'pg';
import { isDatabaseReady } from '../helpers/readyCheck';
import type { DataCache, NetworkMap, Pacs002 } from '../interfaces';
import type { Alert } from '../interfaces/processor-files/Alert';
import type { Evaluation } from '../interfaces/processor-files/TADPReport';
import { type DBConfig, type EvaluationDB, readyChecks } from '../services/dbManager';
import type { PgQueryConfig } from '../interfaces/database';

export async function evaluationBuilder(manager: EvaluationDB, evaluationConfig: DBConfig): Promise<void> {
  const conf: PoolConfig = {
    host: evaluationConfig.url,
    // port:
    database: evaluationConfig.databaseName,
    user: evaluationConfig.user,
    password: evaluationConfig.password,
    ssl: {
      ca: fs.existsSync(evaluationConfig.certPath) ? [fs.readFileSync(evaluationConfig.certPath).toString()] : [],
    },
  } as const;

  manager._evaluation = new Pool(conf);

  try {
    const dbReady = await isDatabaseReady(manager._evaluation);
    readyChecks.EvaluationDB = dbReady ? 'Ok' : 'err';
  } catch (err) {
    readyChecks.EvaluationDB = err;
  }

  manager.getReportByMessageId = async (messageid: string): Promise<Evaluation | undefined> => {
    const query: PgQueryConfig = {
      text: `SELECT 
              evaluation 
            FROM 
              evaluation 
            WHERE 
              messageId = $1`,
      values: [messageid],
    };

    const queryRes = await manager._evaluation.query<{ evaluation: Evaluation }>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].evaluation : undefined;

    return toReturn;
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

    const query: PgQueryConfig = {
      text: `INSERT INTO evaluation
              (evaluation)
            VALUES
              ($1)`,
      values: [data],
    };

    await manager._evaluation.query(query);
  };
}
