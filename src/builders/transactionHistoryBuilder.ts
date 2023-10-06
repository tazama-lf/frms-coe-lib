import { aql, Database } from 'arangojs';
import { type AqlQuery } from 'arangojs/aql';
import * as fs from 'fs';
import { formatError } from '../helpers/formatter';
import { isDatabaseReady } from '../helpers/readyCheck';
import { AccountType, type NetworkMap, type Pacs002, type Pacs008, type Pain001, type Pain013 } from '../interfaces';
import { dbTransactions } from '../interfaces/ArangoCollections';
import { readyChecks, type DatabaseManagerType, type DBConfig } from '../services/dbManager';

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
    readyChecks.TransactionHistoryD = `err, ${formatError(err)}`;
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
        FILTER doc.FIToFICstmrCdt.CdtTrfTxInf.PmtId.EndToEndId == ${endToEndId}
        RETURN doc
      `;

      return await (await manager._transactionHistory?.query(query))?.batches.all();
    };
  } else {
    manager.getTransactionPacs008 = async (endToEndId: string) => {
      const db = manager._transactionHistory?.collection(dbTransactions.pacs008);

      const query: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.FIToFICstmrCdt.CdtTrfTxInf.PmtId.EndToEndId == ${endToEndId}
        RETURN doc
      `;

      return await (await manager._transactionHistory?.query(query))?.batches.all();
    };
  }

  manager.getTransactionPain001 = async (endToEndId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.PmtId.EndToEndId == ${endToEndId}
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getDebtorPain001Msgs = async (debtorId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.CstmrCdtTrfInitn.PmtInf.DbtrAcct.Id.Othr.Id == ${debtorId}
      SORT doc.CstmrCdtTrfInitn.GrpHdr.CreDtTm
      LIMIT 1
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getCreditorPain001Msgs = async (creditorId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.CdtrAcct.Id.Othr.Id == ${creditorId}
      SORT doc.CstmrCdtTrfInitn.GrpHdr.CreDtTm
      LIMIT 1
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getSuccessfulPacs002Msgs = async (endToEndId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pacs002);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.FIToFIPmtSts.TxInfAndSts.OrgnlEndToEndId == ${endToEndId}
      && doc.FIToFIPmtSts.TxInfAndSts.TxSts == 'ACCC'
      SORT doc.FIToFIPmtSts.GrpHdr.CreDtTm DESC
      LIMIT 1
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getSuccessfulPacs002EndToEndIds = async (endToEndIds: string[]) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pacs002);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.FIToFIPmtSts.TxInfAndSts.OrgnlEndToEndId IN ${endToEndIds}
      FILTER doc.FIToFIPmtSts.TxInfAndSts.TxSts == 'ACCC'
      RETURN doc.FIToFIPmtSts.TxInfAndSts.OrgnlEndToEndId
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getDebtorPacs002Msgs = async (endToEndId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pacs002);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.FIToFIPmtSts.TxInfAndSts.OrgnlEndToEndId == ${endToEndId}
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getEquivalentPain001Msg = async (endToEndIds: string[]) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.PmtId.EndToEndId IN ${endToEndIds}
      SORT  doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.PmtId.EndToEndId DESC
      RETURN doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.RmtInf.Ustrd
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getAccountEndToEndIds = async (accountId: string, accountType: AccountType) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pacs008);
    const filterType =
      accountType === AccountType.CreditorAcct
        ? aql`FILTER doc.FIToFICstmrCdt.CdtTrfTxInf.CdtrAcct.Id.Othr.Id == ${accountId}`
        : aql`FILTER doc.FIToFICstmrCdt.CdtTrfTxInf.DbtrAcct.Id.Othr.Id == ${accountId}`;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      ${filterType}
      RETURN {
        e2eId: doc.FIToFICstmrCdt.CdtTrfTxInf.PmtId.EndToEndId,
        timestamp: DATE_TIMESTAMP(doc.FIToFICstmrCdt.GrpHdr.CreDtTm)
      }
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getAccountHistoryPacs008Msgs = async (accountId: string, accountType: AccountType) => {
    const db = manager._transactionHistory?.collection(dbTransactions.pacs008);
    const filterType =
      accountType === AccountType.CreditorAcct
        ? aql`FILTER doc.FIToFICstmrCdt.CdtTrfTxInf.CdtrAcct.Id.Othr.Id == ${accountId}`
        : aql`FILTER doc.FIToFICstmrCdt.CdtTrfTxInf.DbtrAcct.Id.Othr.Id == ${accountId}`;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      ${filterType}
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  if (!manager._transaction) {
    manager.insertTransaction = async (transactionID: string, transaction: unknown, networkMap: NetworkMap, alert: unknown) => {
      const data = {
        transactionID,
        transaction,
        networkMap,
        report: alert,
      };

      return await manager._transactionHistory?.collection(dbTransactions.transactions).save(data, { overwriteMode: 'ignore' });
    };
  }

  manager.saveTransactionHistory = async (tran: Pain001 | Pain013 | Pacs008 | Pacs002, col: string) => {
    const db = manager._transactionHistory?.collection(col);
    return await db?.save(tran, { overwriteMode: 'ignore' });
  };
}
