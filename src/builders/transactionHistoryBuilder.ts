// SPDX-License-Identifier: Apache-2.0

import { aql, Database } from 'arangojs';
import { type AqlQuery } from 'arangojs/aql';
import * as fs from 'fs';
import { formatError } from '../helpers/formatter';
import { isDatabaseReady } from '../helpers/readyCheck';
import { AccountType, type NetworkMap, type Pacs002, type Pacs008, type Pain001, type Pain013 } from '../interfaces';
import { dbEvaluateResults, dbTransactionsHistory } from '../interfaces/ArangoCollections';
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
    readyChecks.TransactionHistoryDB = `err, ${formatError(err)}`;
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

  manager.getTransactionPacs008 = async (endToEndId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pacs008);

    const query: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.FIToFICstmrCdtTrf.CdtTrfTxInf.PmtId.EndToEndId == ${endToEndId}
        RETURN doc
      `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getTransactionPain001 = async (endToEndId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.PmtId.EndToEndId == ${endToEndId}
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getDebtorPain001Msgs = async (debtorId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${debtorId} IN doc.CstmrCdtTrfInitn.PmtInf.DbtrAcct.Id.Othr[*].Id
      SORT doc.CstmrCdtTrfInitn.GrpHdr.CreDtTm
      LIMIT 1
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getCreditorPain001Msgs = async (creditorId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${creditorId} IN doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.CdtrAcct.Id.Othr[*].Id
      SORT doc.CstmrCdtTrfInitn.GrpHdr.CreDtTm
      LIMIT 1
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getSuccessfulPacs002Msgs = async (endToEndId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pacs002);

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
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pacs002);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.FIToFIPmtSts.TxInfAndSts.OrgnlEndToEndId IN ${endToEndIds}
      FILTER doc.FIToFIPmtSts.TxInfAndSts.TxSts == 'ACCC'
      RETURN doc.FIToFIPmtSts.TxInfAndSts.OrgnlEndToEndId
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getDebtorPacs002Msgs = async (endToEndId: string) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pacs002);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.FIToFIPmtSts.TxInfAndSts.OrgnlEndToEndId == ${endToEndId}
      RETURN doc
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getEquivalentPain001Msg = async (endToEndIds: string[]) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.PmtId.EndToEndId IN ${endToEndIds}
      SORT  doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.PmtId.EndToEndId DESC
      RETURN doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.RmtInf.Ustrd
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getAccountEndToEndIds = async (accountId: string, accountType: AccountType) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pacs008);
    const filterType =
      accountType === AccountType.CreditorAcct
        ? aql`FILTER ${accountId} IN doc.FIToFICstmrCdtTrf.CdtTrfTxInf.CdtrAcct.Id.Othr[*].Id`
        : aql`FILTER ${accountId} IN doc.FIToFICstmrCdtTrf.CdtTrfTxInf.DbtrAcct.Id.Othr[*].Id`;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      ${filterType}
      RETURN {
        e2eId: doc.FIToFICstmrCdtTrf.CdtTrfTxInf.PmtId.EndToEndId,
        timestamp: DATE_TIMESTAMP(doc.FIToFICstmrCdtTrf.GrpHdr.CreDtTm)
      }
    `;

    return await (await manager._transactionHistory?.query(query))?.batches.all();
  };

  manager.getAccountHistoryPacs008Msgs = async (accountId: string, accountType: AccountType) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pacs008);
    const filterType =
      accountType === AccountType.CreditorAcct
        ? aql`FILTER ${accountId} IN doc.FIToFICstmrCdtTrf.CdtTrfTxInf.CdtrAcct.Id.Othr[*].Id`
        : aql`FILTER ${accountId} IN doc.FIToFICstmrCdtTrf.CdtTrfTxInf.DbtrAcct.Id.Othr[*].Id`;

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

      return await manager._transactionHistory?.collection(dbEvaluateResults.transactions).save(data, { overwriteMode: 'ignore' });
    };
  }

  manager.saveTransactionHistory = async (tran: Pain001 | Pain013 | Pacs008 | Pacs002, col: string) => {
    const db = manager._transactionHistory?.collection(col);
    return await db?.save(tran, { overwriteMode: 'ignore' });
  };

  manager.saveTransactionHistoryPain001 = async (tran: Pain001) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pain001);
    return await db?.save(tran, { overwriteMode: 'ignore' });
  };

  manager.saveTransactionHistoryPain013 = async (tran: Pain013) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pain013);
    return await db?.save(tran, { overwriteMode: 'ignore' });
  };

  manager.saveTransactionHistoryPacs008 = async (tran: Pacs008) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pacs008);
    return await db?.save(tran, { overwriteMode: 'ignore' });
  };

  manager.saveTransactionHistoryPacs002 = async (tran: Pacs002) => {
    const db = manager._transactionHistory?.collection(dbTransactionsHistory.pacs002);
    return await db?.save(tran, { overwriteMode: 'ignore' });
  };
}
