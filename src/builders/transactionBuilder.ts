// SPDX-License-Identifier: Apache-2.0

import { Database } from 'arangojs';
import * as fs from 'fs';
import { type DBConfig, type DatabaseManagerType, readyChecks } from '../services/dbManager';
import { isDatabaseReady } from '../helpers/readyCheck';
import { type AqlQuery, aql } from 'arangojs/aql';
import { type NetworkMap } from '../interfaces';
import { dbEvaluateResults } from '../interfaces/ArangoCollections';

export async function transactionBuilder(manager: DatabaseManagerType, transactionHistoryConfig: DBConfig, redis: boolean): Promise<void> {
  manager._transaction = new Database({
    url: transactionHistoryConfig.url,
    databaseName: transactionHistoryConfig.databaseName,
    auth: {
      username: transactionHistoryConfig.user,
      password: transactionHistoryConfig.password,
    },
    agentOptions: {
      ca: fs.existsSync(transactionHistoryConfig.certPath) ? [fs.readFileSync(transactionHistoryConfig.certPath)] : [],
    },
  });

  try {
    const dbReady = await isDatabaseReady(manager._transaction);
    readyChecks.TransactionDB = dbReady ? 'Ok' : 'err';
  } catch (err) {
    readyChecks.TransactionDB = err;
  }

  manager.queryTransactionDB = async (collection: string, filter: string, limit?: number) => {
    const db = manager._transaction?.collection(collection);
    const aqlFilter = aql`${filter}`;
    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter}
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._transaction?.query(query))?.batches.all();
  };

  manager.getReportByMessageId = async (messageid: string) => {
    const db = manager._transaction?.collection(dbEvaluateResults.transactions);
    const messageidAql = aql`${messageid}`;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.transaction.FIToFIPmtSts.GrpHdr.MsgId == ${messageidAql}
      RETURN doc
    `;

    return await (await manager._transaction?.query(query))?.batches.all();
  };

  manager.insertTransaction = async (transactionID: string, transaction: unknown, networkMap: NetworkMap, alert: unknown) => {
    const data = {
      transactionID,
      transaction,
      networkMap,
      report: alert,
    };

    return await manager._transaction?.collection(dbEvaluateResults.transactions).save(data, { overwriteMode: 'ignore' });
  };
}
