import { Database } from 'arangojs';
import * as fs from 'fs';
import { DBConfig, DatabaseManagerType, readyChecks } from '../services/dbManager';
import { isDatabaseReady } from '../helpers/readyCheck';
import { AqlQuery, aql } from 'arangojs/aql';
import { NetworkMap } from '../interfaces';

export async function transactionBuilder(
  manager: DatabaseManagerType,
  transactionHistoryConfig: DBConfig,
  redis: boolean,
): Promise<void> {
  manager._transactions = new Database({
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
    const dbReady = await isDatabaseReady(manager._transactions);
    readyChecks.TransactionHistoryDB = dbReady ? 'Ok' : 'err';
  } catch (err) {
    readyChecks.TransactionHistoryDB = err;
  }

  manager.queryTransactionDB = async (collection: string, filter: string, limit?: number) => {
    const db = manager._transactions?.collection(collection);
    const aqlFilter = aql`${filter}`;
    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter}
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._transactions?.query(query))?.batches.all();
  };

  manager.insertTransaction = async (transactionID: string, transaction: unknown, networkMap: NetworkMap, alert: unknown) => {
    const data = {
      transactionID,
      transaction,
      networkMap,
      report: alert,
    };

    return await manager._transactions?.collection("transactions").save(data, { overwriteMode: 'ignore' });
  };
}
