import { aql, Database } from 'arangojs';
import { type AqlQuery } from 'arangojs/aql';
import * as fs from 'fs';
import { AccountType, type Pain001, type NetworkMap, type Pain013, type Pacs008, type Pacs002 } from '../interfaces';
import { dbTransactions } from '../interfaces/ArangoCollections';
import { readyChecks, type DatabaseManagerType, type DBConfig } from '../services/dbManager';
import { isDatabaseReady } from '../helpers/readyCheck';

export async function transactionHistoryBuilder(
  manager: DatabaseManagerType,
  transactionHistoryConfig: DBConfig,
  redis: boolean,
): Promise<void> {
  manager._transactionHistory = new Database({
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
    const dbReady = await isDatabaseReady(manager._transactionHistory);
    readyChecks.TransactionHistoryDB = dbReady ? 'Ok' : 'err';
  } catch (error) {
    const err = error as Error;
    readyChecks.TransactionHistoryD = `err, ${JSON.stringify({ ...err, name: err.name, message: err.message, stack: err.stack })}`;
  }

  manager.queryTransactionDB = async (collection: string, filter: string, limit?: number) => {
    const db = manager._transactionHistory?.collection(collection);
    const aqlFilter = aql`${filter}`;
    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter}
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  if (redis) {
    manager.getTransactionPacs008 = async (endToEndId: string, cacheKey = '') => {
      let cacheVal: string[] = [];

      if (cacheKey !== '') {
        cacheVal = await manager.getMembers!(cacheKey);
        if (cacheVal.length > 0) return await Promise.resolve(cacheVal);
      }

      const db = manager._transactionHistory?.collection(dbTransactions.pacs008);

      const query: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.EndToEndId == ${endToEndId}
        RETURN doc
      `;

      return await (await manager._transactionHistory?.query(query))?.batches.all();
    };
  } else {
    manager.getTransactionPacs008 = async (endToEndId: string) => {
      const db = manager._transactionHistory?.collection(dbTransactions.pacs008);

      const query: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.EndToEndId == ${endToEndId}
        RETURN doc
      `;

      return await (await manager._transactionHistory?.query(query))?.batches.all();
    };
  }

  manager.getTransactionPain001 = async (endToEndId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.EndToEndId == ${endToEndId}
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getDebtorPain001Msgs = async (debtorId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.DebtorAcctId == ${debtorId}
      SORT doc.CreDtTm 
      LIMIT 1 
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getCreditorPain001Msgs = async (creditorId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.CreditorAcctId == ${creditorId}
      SORT doc.CreDtTm 
      LIMIT 1
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getSuccessfulPacs002Msgs = async (endToEndId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pacs002);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId == ${endToEndId}
      && doc.TxSts == 'ACCC'
      SORT doc.CreDtTm DESC
      LIMIT 1
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getSuccessfulPacs002EndToEndIds = async (endToEndIds: string[]) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pacs002);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId IN ${endToEndIds}
      FILTER doc.TxSts == 'ACCC'
      RETURN doc.EndToEndId
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getDebtorPacs002Msgs = async (endToEndId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pacs002);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId == ${endToEndId}
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getEquivalentPain001Msg = async (endToEndIds: string[]) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId IN ${endToEndIds}
      SORT  doc.EndToEndId DESC 
      RETURN doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.RmtInf.Ustrd 
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getAccountEndToEndIds = async (accountId: string, accountType: AccountType) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pacs008);
    const filterType =
      accountType === AccountType.CreditorAcct
        ? aql`FILTER doc.CreditorAcctId == ${accountId}`
        : aql`FILTER doc.DebtorAcctId == ${accountId}`;

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      ${filterType}
      RETURN { 
        e2eId: doc.EndToEndId,
        timestamp: DATE_TIMESTAMP(doc.CreDtTm) 
      }
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getAccountHistoryPacs008Msgs = async (accountId: string, accountType: AccountType) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pacs008);
    const filterType =
      accountType === AccountType.CreditorAcct
        ? aql`FILTER doc.CreditorAcctId == ${accountId}`
        : aql`FILTER doc.DebtorAcctId == ${accountId}`;

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      ${filterType}
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.insertTransaction = async (transactionID: string, transaction: unknown, networkMap: NetworkMap, alert: unknown) => {
    const data = {
      transactionID,
      transaction,
      networkMap,
      report: alert,
    };

    return await manager._transactionHistory?.collection(dbTransactions.transactions).save(data, { overwriteMode: 'ignore' });
  };

  manager.saveTransactionHistory = async (tran: Pain001 | Pain013 | Pacs008 | Pacs002, col: string) => {
    const db = manager._transactionHistory?.collection(col);
    return await db?.save(tran, { overwriteMode: 'ignore' });
  };
}
