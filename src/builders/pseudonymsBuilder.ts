// SPDX-License-Identifier: Apache-2.0

import { aql, Database } from 'arangojs';
import { join, type AqlQuery, type GeneratedAqlQuery } from 'arangojs/aql';
import * as fs from 'fs';
import { formatError } from '../helpers/formatter';
import { isDatabaseReady } from '../helpers/readyCheck';
import { type ConditionEdge, type EntityCondition, type Othr, type TransactionRelationship } from '../interfaces';
import { dbPseudonyms } from '../interfaces/ArangoCollections';
import { readyChecks, type DatabaseManagerType, type DBConfig } from '../services/dbManager';

export async function pseudonymsBuilder(manager: DatabaseManagerType, pseudonymsConfig: DBConfig): Promise<void> {
  manager._pseudonymsDb = new Database({
    url: pseudonymsConfig.url,
    databaseName: pseudonymsConfig.databaseName,
    auth: {
      username: pseudonymsConfig.user,
      password: pseudonymsConfig.password,
    },
    agentOptions: {
      ca: fs.existsSync(pseudonymsConfig.certPath) ? [fs.readFileSync(pseudonymsConfig.certPath)] : [],
    },
  });

  try {
    const dbReady = await isDatabaseReady(manager._pseudonymsDb);
    readyChecks.PseudonymsDB = dbReady ? 'Ok' : 'err';
  } catch (error) {
    const err = error as Error;
    readyChecks.PseudonymsDB = `err, ${formatError(err)}`;
  }

  manager.queryPseudonymDB = async (collection: string, filter: string, limit?: number) => {
    const db = manager._pseudonymsDb?.collection(collection);
    const aqlFilter = aql`${filter}`;
    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter}
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getPseudonyms = async (hash: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.self);

    const query: AqlQuery = aql`
      FOR i IN ${db}
      FILTER i.pseudonym == ${hash}
      RETURN i
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.addAccount = async (hash: string) => {
    const data = { _key: hash };

    return await manager._pseudonymsDb?.collection(dbPseudonyms.accounts).save(data, { overwriteMode: 'ignore' });
  };

  manager.saveTransactionRelationship = async (tR: TransactionRelationship) => {
    const data = {
      _key: tR.MsgId,
      _from: tR.from,
      _to: tR.to,
      TxTp: tR.TxTp,
      TxSts: tR.TxSts,
      CreDtTm: tR.CreDtTm,
      Amt: tR.Amt,
      Ccy: tR.Ccy,
      PmtInfId: tR.PmtInfId,
      EndToEndId: tR.EndToEndId,
      lat: tR.lat,
      long: tR.long,
    };
    return await manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship).save(data, { overwriteMode: 'ignore' });
  };

  manager.getPacs008Edge = async (endToEndIds: string[]) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);

    const query = aql`
      FOR doc IN ${db}
      FILTER doc.EndToEndId IN ${endToEndIds} && doc.TxTp == 'pacs.008.001.10'
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getPacs008Edges = async (accountId: string, threshold?: string, amount?: number) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const account = `accounts/${accountId}`;
    const filters: GeneratedAqlQuery[] = [aql`FILTER doc.TxTp == 'pacs.008.001.10' && doc._to == ${account}`];

    if (threshold !== undefined) filters.push(aql`FILTER doc.CreDtTm < ${threshold}`);
    if (amount !== undefined) filters.push(aql`FILTER doc.Amt == ${amount}`);

    const query = aql`
      FOR doc IN ${db}
      ${join(filters)}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getPacs002Edge = async (endToEndIds: string[]) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);

    const query = aql`
      FOR doc IN ${db}
      FILTER doc.EndToEndId IN ${endToEndIds} && doc.TxTp == 'pacs.002.001.12'
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getDebtorPacs002Edges = async (debtorId: string): Promise<unknown> => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const debtorAccount = `accounts/${debtorId}`;
    const debtorAccountAql = aql`${debtorAccount}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == ${debtorAccountAql}
      FILTER doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC'
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getIncomingPacs002Edges = async (accountId: string, limit?: number): Promise<unknown> => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const account = `accounts/${accountId}`;
    const accountAql = aql`${account}`;

    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._to == ${accountAql}
      FILTER doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC'
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getOutgoingPacs002Edges = async (accountId: string, limit?: number): Promise<unknown> => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const account = `accounts/${accountId}`;
    const accountAql = aql`${account}`;

    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == ${accountAql}
      FILTER doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC'
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getSuccessfulPacs002Edges = async (creditorId: string[], debtorId: string, endToEndId: string[]): Promise<unknown> => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const debtorAccount = `accounts/${debtorId}`;
    const debtorAccountAql = aql`${debtorAccount}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._to IN ${creditorId}
      FILTER doc._from == ${debtorAccountAql}
      FILTER doc.TxTp == 'pacs.002.001.12'
      FILTER doc.EndToEndId IN ${endToEndId}
      FILTER doc.TxSts == 'ACCC'
      SORT   doc.CreDtTm DESC
      LIMIT 2
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getDebtorPacs008Edges = async (debtorId: string, endToEndId = '') => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const debtorAccount = `accounts/${debtorId}`;
    const debtorAccountAql = aql`${debtorAccount}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == ${debtorAccountAql}
      FILTER doc.TxTp == 'pacs.008.001.10'
      SORT   doc.CreDtTm DESC
      LIMIT 2
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getCreditorPacs008Edges = async (creditorId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const creditorAccount = `accounts/${creditorId}`;
    const creditorAccountAql = aql`${creditorAccount}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._to == ${creditorAccountAql}
      FILTER doc.TxTp == 'pacs.008.001.10'
      SORT   doc.CreDtTm DESC
      LIMIT 2
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getPreviousPacs008Edges = async (accountId: string, limit?: number, to?: string[]) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);

    const filters: GeneratedAqlQuery[] = [];
    filters.push(aql`FILTER doc.TxTp == 'pacs.008.001.10'`);
    if (to !== undefined) filters.push(aql`FILTER doc._to IN ${to}`);

    const aqlLimit = limit ? aql`${limit}` : aql`3`;
    const account = `accounts/${accountId}`;
    const accountAql = aql`${account}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == ${accountAql}
      ${join(filters)}
      SORT doc.CreDtTm DESC
      LIMIT ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getCreditorPacs002Edges = async (creditorId: string, threshold: number) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const date: string = new Date(new Date().getTime() - threshold).toISOString();

    const creditorAccount = `accounts/${creditorId}`;
    const creditorAccountAql = aql`${creditorAccount}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == '${creditorAccountAql}' && doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC' && doc.CreDtTm >= ${date}
        RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.saveCondition = async (condition: EntityCondition) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.conditions);
    return await db?.save(condition, { overwriteMode: 'ignore' });
  };

  manager.governedAsCreditorBy = async (conditionId: string, accountEntityId: string, condtionEdge: ConditionEdge) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.governed_as_creditor_by);
    const condId = conditionId.substring(conditionId.indexOf('/') + 1, conditionId.length);
    const accEntId = accountEntityId.substring(accountEntityId.indexOf('/') + 1, accountEntityId.length);
    const _key = `${condId}${accEntId}`;
    const _from = accountEntityId;
    const _to = conditionId;
    return await db?.save(
      { _key, _from, _to, evtTp: condtionEdge.evtTp, incptnDtTm: condtionEdge.incptnDtTm, xprtnDtTm: condtionEdge?.xprtnDtTm },
      { overwriteMode: 'ignore' },
    );
  };

  manager.governedAsDebtorBy = async (conditionId: string, accountEntityId: string, condtionEdge: ConditionEdge) => {
    const condId = conditionId.substring(conditionId.indexOf('/') + 1, conditionId.length);
    const accEntId = accountEntityId.substring(accountEntityId.indexOf('/') + 1, accountEntityId.length);
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.governed_as_debtor_by);
    const _key = `${condId}${accEntId}`;
    const _from = accountEntityId;
    const _to = conditionId;
    return await db?.save({ _key, _from, _to, condtionEdge }, { overwriteMode: 'ignore' });
  };

  manager.saveAccount = async (key: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.accounts);
    return await db?.save({ _key: key }, { overwriteMode: 'ignore' });
  };

  manager.getConditionsByEntity = async (ntty: Othr) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.conditions);
    const nttyPrtry = aql`${String(ntty.SchmeNm.Prtry)}`;
    const nttyId = aql`${String(ntty.Id)}`;

    const query = aql`FOR doc IN ${db}
    FILTER doc.ntty.Id == ${nttyId}
    AND doc.ntty.SchmeNm.Prtry == ${nttyPrtry}
    AND (doc.xprtnDtTm > DATE_ISO8601(DATE_NOW())
    OR doc.xprtnDtTm == null)
    RETURN doc`;

    const result = (await (await manager._pseudonymsDb?.query(query))?.batches.all()) as Array<Array<Record<string, unknown>>>;
    return result[0];
  };

  manager.getEntity = async (ntty: Othr) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.entities);
    const entityIdenity = aql`${ntty.Id + ntty.SchmeNm.Prtry}`;

    const query = aql`FOR doc IN ${db}
      FILTER doc._key == ${entityIdenity}
      RETURN doc`;

    const result = (await (await manager._pseudonymsDb?.query(query))?.batches.all()) as Array<Array<Record<string, unknown>>>;
    return result[0];
  };

  manager.saveEntity = async (entityId: string, CreDtTm: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.entities);
    return await db?.save({ _key: entityId, Id: entityId, CreDtTm }, { overwriteMode: 'ignore' });
  };

  manager.saveAccountHolder = async (entityId: string, accountId: string, CreDtTm: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.account_holder);
    const _key = `${accountId}${entityId}`;
    const _from = `entities/${entityId}`;
    const _to = `accounts/${accountId}`;
    return await db?.save({ _key, _from, _to, CreDtTm }, { overwriteMode: 'ignore' });
  };
}
