// SPDX-License-Identifier: Apache-2.0

import { aql, Database } from 'arangojs';
import { join, type AqlQuery, type GeneratedAqlQuery } from 'arangojs/aql';
import * as fs from 'node:fs';
import { v4 } from 'uuid';
import { formatError } from '../helpers/formatter';
import { isDatabaseReady } from '../helpers/readyCheck';
import type { AccountCondition, ConditionEdge, EntityCondition, TransactionRelationship } from '../interfaces';
import { dbPseudonyms } from '../interfaces/ArangoCollections';
import type { RawConditionResponse } from '../interfaces/event-flow/EntityConditionEdge';
import { readyChecks, type DatabaseManagerType, type DBConfig } from '../services/dbManager';

export async function pseudonymsBuilder(manager: DatabaseManagerType, pseudonymsConfig: DBConfig): Promise<void> {
  manager._pseudonymsDb = new Database({
    url: pseudonymsConfig.url,
    databaseName: pseudonymsConfig.databaseName,
    auth: { username: pseudonymsConfig.user, password: pseudonymsConfig.password },
    agentOptions: { ca: fs.existsSync(pseudonymsConfig.certPath) ? [fs.readFileSync(pseudonymsConfig.certPath)] : [] },
  });

  try {
    const dbReady = await isDatabaseReady(manager._pseudonymsDb);
    readyChecks.PseudonymsDB = dbReady ? 'Ok' : 'err';
  } catch (error) {
    const err = error as Error;
    readyChecks.PseudonymsDB = `err, ${formatError(err)}`;
  }

  manager.queryPseudonymDB = async (collection: string, filter: string, tenantId: string, limit?: number) => {
    const db = manager._pseudonymsDb?.collection(collection);
    const aqlFilter = aql`${filter}`;
    const aqlTenantId = aql`${tenantId}`;
    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter} && doc.TenantId == ${aqlTenantId}
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

  manager.saveTransactionRelationship = async (tR: TransactionRelationship) => {
    const data = {
      _key: tR.MsgId,
      _from: tR.from,
      _to: tR.to,
      TxTp: tR.TxTp,
      TenantId: tR.TenantId,
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

  manager.getPacs008Edge = async (endToEndIds: string[], tenantId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const aqltenantId = aql`${tenantId}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc.EndToEndId IN ${endToEndIds} && doc.TxTp == 'pacs.008.001.10' && doc.TenantId == ${aqltenantId}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getPacs008Edges = async (accountId: string, tenantId: string, threshold?: string, amount?: number) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const account = `accounts/${accountId}`;
    const aqltenantId = aql`${tenantId}`;
    const filters: GeneratedAqlQuery[] = [
      aql`FILTER doc.TxTp == 'pacs.008.001.10' && doc._to == ${account} && doc.TenantId == ${aqltenantId}`,
    ];

    if (threshold !== undefined) filters.push(aql`FILTER doc.CreDtTm < ${threshold}`);
    if (amount !== undefined) filters.push(aql`FILTER doc.Amt == ${amount}`);

    const query = aql`
      FOR doc IN ${db}
      ${join(filters)}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getPacs002Edge = async (endToEndIds: string[], tenantId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const aqltenantId = aql`${tenantId}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc.EndToEndId IN ${endToEndIds} && doc.TxTp == 'pacs.002.001.12' && doc.TenantId == ${aqltenantId}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getDebtorPacs002Edges = async (debtorId: string, tenantId: string): Promise<unknown> => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const debtorAccount = `accounts/${debtorId}`;
    const debtorAccountAql = aql`${debtorAccount}`;
    const aqltenantId = aql`${tenantId}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == ${debtorAccountAql}
      FILTER doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC' && doc.TenantId == ${aqltenantId}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getIncomingPacs002Edges = async (accountId: string, tenantId: string, limit?: number): Promise<unknown> => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const account = `accounts/${accountId}`;
    const accountAql = aql`${account}`;
    const aqltenantId = aql`${tenantId}`;

    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._to == ${accountAql}
      FILTER doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC' && doc.TenantId == ${aqltenantId}
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getOutgoingPacs002Edges = async (accountId: string, tenantId: string, limit?: number): Promise<unknown> => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const account = `accounts/${accountId}`;
    const accountAql = aql`${account}`;
    const aqltenantId = aql`${tenantId}`;

    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == ${accountAql}
      FILTER doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC' && doc.TenantId == ${aqltenantId}
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getSuccessfulPacs002Edges = async (
    creditorId: string[],
    debtorId: string,
    endToEndId: string[],
    tenantId: string,
  ): Promise<unknown> => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const debtorAccount = `accounts/${debtorId}`;
    const debtorAccountAql = aql`${debtorAccount}`;
    const aqltenantId = aql`${tenantId}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._to IN ${creditorId}
      FILTER doc._from == ${debtorAccountAql}
      FILTER doc.TxTp == 'pacs.002.001.12'
      FILTER doc.TenantId == ${aqltenantId}
      FILTER doc.EndToEndId IN ${endToEndId}
      FILTER doc.TxSts == 'ACCC'
      SORT   doc.CreDtTm DESC
      LIMIT 2
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getDebtorPacs008Edges = async (debtorId: string, tenantId: string, endToEndId = '') => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const debtorAccount = `accounts/${debtorId}`;
    const debtorAccountAql = aql`${debtorAccount}`;
    const aqltenantId = aql`${tenantId}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == ${debtorAccountAql}
      FILTER doc.TxTp == 'pacs.008.001.10'
      FILTER doc.TenantId == ${aqltenantId}
      SORT   doc.CreDtTm DESC
      LIMIT 2
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getCreditorPacs008Edges = async (creditorId: string, tenantId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const creditorAccount = `accounts/${creditorId}`;
    const creditorAccountAql = aql`${creditorAccount}`;
    const aqltenantId = aql`${tenantId}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._to == ${creditorAccountAql}
      FILTER doc.TxTp == 'pacs.008.001.10'
      FILTER doc.TenantId == ${aqltenantId}
      SORT   doc.CreDtTm DESC
      LIMIT 2
      RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getPreviousPacs008Edges = async (accountId: string, tenantId: string, limit?: number, to?: string[]) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const aqltenantId = aql`${tenantId}`;

    const filters: GeneratedAqlQuery[] = [];
    filters.push(aql`FILTER doc.TxTp == 'pacs.008.001.10'`);
    filters.push(aql`FILTER doc.TenantId == ${aqltenantId}`);
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

  manager.getCreditorPacs002Edges = async (creditorId: string, tenantId: string, threshold: number) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.transactionRelationship);
    const aqltenantId = aql`${tenantId}`;
    const date: string = new Date(new Date().getTime() - threshold).toISOString();

    const creditorAccount = `accounts/${creditorId}`;
    const creditorAccountAql = aql`${creditorAccount}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == '${creditorAccountAql}' && doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC' && doc.CreDtTm >= ${date}
      FILTER doc.TenantId == ${aqltenantId}
        RETURN doc
    `;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.saveAccount = async (key: string, tenantId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.accounts);
    const data = {
      _key: key,
      TenantId: tenantId,
    };
    return await db?.save(data, { overwriteMode: 'ignore' });
  };

  manager.saveEntity = async (entityId: string, tenantId: string, CreDtTm: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.entities);
    const data = {
      _key: entityId,
      Id: entityId,
      TenantId: tenantId,
      CreDtTm,
    };
    return await db?.save(data, { overwriteMode: 'ignore' });
  };

  manager.saveAccountHolder = async (entityId: string, accountId: string, CreDtTm: string, tenantId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.account_holder);
    const _key = `${accountId}${entityId}`;
    const _from = `entities/${entityId}`;
    const _to = `accounts/${accountId}`;
    const data = {
      _key,
      _from,
      _to,
      CreDtTm,
      TenantId: tenantId,
    };

    return await db?.save(data, { overwriteMode: 'ignore' });
  };

  manager.getConditionsByEntity = async (entityId: string, SchemeProprietary: string, tenantId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.conditions);
    const date: string = new Date().toISOString();
    const nttyPrtry = SchemeProprietary;
    const nttyId = entityId;
    const nttyPrtryAql = aql`AND doc.ntty.schmeNm.prtry == ${nttyPrtry}`;
    const nttyIdAql = aql`FILTER doc.ntty.id == ${nttyId}`;
    const aqltenantId = aql`${tenantId}`;

    const query = aql`FOR doc IN ${db}
    ${nttyIdAql}
    ${nttyPrtryAql}
    AND (doc.xprtnDtTm > ${date}
    OR doc.xprtnDtTm == null)
    FILTER doc.TenantId == ${aqltenantId}
    RETURN doc`;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getEntityConditionsByGraph = async (id: string, proprietary: string, tenantId: string, retrieveAll?: boolean) => {
    const nowDateTime = new Date().toISOString();
    const aqltenantId = aql`${tenantId}`;
    const filterAql = aql`
      LET fromVertex = DOCUMENT(edge._from)
      LET toVertex = DOCUMENT(edge._to)
      FILTER toVertex.ntty.id == ${id}
      FILTER toVertex.tenantId == ${aqltenantId}
      ${!retrieveAll ? aql`AND toVertex.incptnDtTm < ${nowDateTime}` : aql``}
      ${!retrieveAll ? aql`AND (toVertex.xprtnDtTm > ${nowDateTime} OR toVertex.xprtnDtTm == null)` : aql``}
      AND toVertex.ntty.schmeNm.prtry == ${proprietary}
      ${!retrieveAll ? aql`AND edge.incptnDtTm < ${nowDateTime}` : aql``}
      ${!retrieveAll ? aql`AND (edge.xprtnDtTm > ${nowDateTime} OR edge.xprtnDtTm == null)` : aql``}`;

    const result = await (
      await manager._pseudonymsDb!.query<RawConditionResponse>(aql`
      LET gov_cred = (
          FOR edge IN governed_as_creditor_by
          ${filterAql}
          RETURN {
              edge: edge,
              result: fromVertex,
              condition: toVertex
          }
      )

      LET gov_debtor = (
          FOR edge IN governed_as_debtor_by
          ${filterAql}
          RETURN {
              edge: edge,
              result: fromVertex,
              condition: toVertex
          }
      )

      RETURN {
          "governed_as_creditor_by": gov_cred,
          "governed_as_debtor_by": gov_debtor
      }
    `)
    ).batches.all();

    return result;
  };

  manager.getAccountConditionsByGraph = async (id: string, proprietary: string, tenantId: string, agt: string, retrieveAll?: boolean) => {
    const nowDateTime = new Date().toISOString();
    const aqltenantId = aql`${tenantId}`;

    const filterAql = aql`
      LET fromVertex = DOCUMENT(edge._from)
      LET toVertex = DOCUMENT(edge._to)
      FILTER toVertex.acct.id == ${id}
      FILTER toVertex.tenantId == ${aqltenantId}
      ${!retrieveAll ? aql`AND toVertex.incptnDtTm < ${nowDateTime}` : aql``}
      ${!retrieveAll ? aql`AND (toVertex.xprtnDtTm > ${nowDateTime} OR toVertex.xprtnDtTm == null)` : aql``}
      AND toVertex.acct.schmeNm.prtry == ${proprietary}
      AND toVertex.acct.agt.finInstnId.clrSysMmbId.mmbId == ${agt}
      ${!retrieveAll ? aql`AND edge.incptnDtTm < ${nowDateTime}` : aql``}
      ${!retrieveAll ? aql`AND (edge.xprtnDtTm > ${nowDateTime} OR edge.xprtnDtTm == null)` : aql``}`;

    const result = await (
      await manager._pseudonymsDb!.query<RawConditionResponse>(aql`
      LET gov_cred = (
          FOR edge IN governed_as_creditor_account_by
          ${filterAql}
          RETURN {
              edge: edge,
              result: fromVertex,
              condition: toVertex
          }
      )

      LET gov_debtor = (
          FOR edge IN governed_as_debtor_account_by
          ${filterAql}
          RETURN {
              edge: edge,
              result: fromVertex,
              condition: toVertex
          }
      )

      RETURN {
          "governed_as_creditor_account_by": gov_cred,
          "governed_as_debtor_account_by": gov_debtor
      }
    `)
    ).batches.all();

    return result;
  };

  manager.getConditionsByGraph = async (activeOnly: boolean, tenantId: string) => {
    const date: string = new Date().toISOString();

    let filter;
    if (activeOnly) {
      filter = `FILTER edge.xprtnDtTm < ${date} && edge.tenantId == ${tenantId}`;
    }

    const filterAql = aql`
      LET fromVertex = DOCUMENT(edge._from)
      LET toVertex = DOCUMENT(edge._to)
      ${filter}`;

    const result = await (
      await manager._pseudonymsDb!.query<RawConditionResponse>(aql`
      LET gov_acct_cred = (
          FOR edge IN governed_as_creditor_account_by
          ${filterAql}
          RETURN {
              edge: edge,
              result: fromVertex,
              condition: toVertex
          }
      )

      LET gov_acct_debtor = (
          FOR edge IN governed_as_debtor_account_by
          ${filterAql}
          RETURN {
              edge: edge,
              result: fromVertex,
              condition: toVertex
          }
      )

      LET gov_cred = (
          FOR edge IN governed_as_creditor_by
          ${filterAql}
          RETURN {
              edge: edge,
              result: fromVertex,
              condition: toVertex
          }
      )

      LET gov_debtor = (
          FOR edge IN governed_as_debtor_by
          ${filterAql}
          RETURN {
              edge: edge,
              result: fromVertex,
              condition: toVertex
          }
      )

      RETURN {
          "governed_as_creditor_account_by": gov_acct_cred,
          "governed_as_debtor_account_by": gov_acct_debtor,
          "governed_as_creditor_by": gov_cred,
          "governed_as_debtor_by": gov_debtor
      }
    `)
    ).batches.all();

    return result;
  };

  manager.getConditionsByAccount = async (accountId: string, SchemeProprietary: string, tenantId: string, agtMemberId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.conditions);
    const date: string = new Date().toISOString();
    const acctPrtry = SchemeProprietary;
    const acctId = accountId;
    const aqltenantId = aql`FILTER doc.tenantId == ${tenantId}`;
    const conditionAgtMemberId = agtMemberId;
    const acctIdAql = aql`FILTER doc.acct.id == ${acctId}`;
    const acctPrtryAql = aql`AND doc.acct.schmeNm.prtry == ${acctPrtry}`;
    const agtMemberIdAql = aql`AND doc.acct.agt.finInstnId.clrSysMmbId.mmbId == ${conditionAgtMemberId}`;
    const query = aql`FOR doc IN ${db}
    ${acctIdAql}
    ${acctPrtryAql}
    ${agtMemberIdAql}
    ${aqltenantId}
    AND (doc.xprtnDtTm > ${date}
    OR doc.xprtnDtTm == null)
    RETURN doc`;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getConditions = async (activeOnly: boolean, tenantId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.conditions);
    const date: string = new Date().toISOString();

    let filter;
    if (activeOnly) {
      filter = `FILTER doc.xprtnDtTm < ${date} && doc.tenantId == ${tenantId}`;
    }

    const query = aql`FOR doc IN ${db}
      ${filter}
      RETURN doc`;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getEntity = async (entityId: string, SchemeProprietary: string, tenantId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.entities);
    const entityIdentity = `${tenantId}${entityId}${SchemeProprietary}`;
    const aqltenantId = aql`${tenantId}`;
    const entityIdAql = aql`FILTER doc._key == ${entityIdentity} && doc.TenantId == ${aqltenantId}`;

    const query = aql`FOR doc IN ${db}
      ${entityIdAql}
      RETURN doc`;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.getAccount = async (accountId: string, SchemeProprietary: string, agtMemberId: string, tenantId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.accounts);
    const accountIdentity = `${tenantId}${accountId}${SchemeProprietary}${agtMemberId}`;
    const aqltenantId = aql`${tenantId}`;
    const accountIdAql = aql`FILTER doc._key == ${accountIdentity} && doc.TenantId == ${aqltenantId}`;

    const query = aql`FOR doc IN ${db}
      ${accountIdAql}
      RETURN doc`;

    return await (await manager._pseudonymsDb?.query(query))?.batches.all();
  };

  manager.saveCondition = async (condition: EntityCondition | AccountCondition) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.conditions);
    const uuid = v4();
    return await db?.save({ ...condition, _key: uuid, condId: uuid }, { overwriteMode: 'ignore' });
  };

  manager.saveGovernedAsCreditorByEdge = async (conditionId: string, accountEntityId: string, conditionEdge: ConditionEdge) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.governed_as_creditor_by);
    const _from = accountEntityId;
    const _to = conditionId;

    return await db?.save(
      {
        _from,
        _to,
        evtTp: conditionEdge.evtTp,
        incptnDtTm: conditionEdge.incptnDtTm,
        xprtnDtTm: conditionEdge?.xprtnDtTm,
        tenantId: conditionEdge.tenantId,
      },
      { overwriteMode: 'ignore' },
    );
  };

  manager.saveGovernedAsDebtorByEdge = async (conditionId: string, accountEntityId: string, conditionEdge: ConditionEdge) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.governed_as_debtor_by);
    const _from = accountEntityId;
    const _to = conditionId;

    return await db?.save(
      {
        _from,
        _to,
        evtTp: conditionEdge.evtTp,
        incptnDtTm: conditionEdge.incptnDtTm,
        xprtnDtTm: conditionEdge?.xprtnDtTm,
        tenantId: conditionEdge.tenantId,
      },
      { overwriteMode: 'ignore' },
    );
  };

  manager.saveGovernedAsCreditorAccountByEdge = async (conditionId: string, accountEntityId: string, conditionEdge: ConditionEdge) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.governed_as_creditor_account_by);
    const _from = accountEntityId;
    const _to = conditionId;

    return await db?.save(
      {
        _from,
        _to,
        evtTp: conditionEdge.evtTp,
        incptnDtTm: conditionEdge.incptnDtTm,
        xprtnDtTm: conditionEdge?.xprtnDtTm,
        tenantId: conditionEdge.tenantId,
      },
      { overwriteMode: 'ignore' },
    );
  };

  manager.saveGovernedAsDebtorAccountByEdge = async (conditionId: string, accountEntityId: string, conditionEdge: ConditionEdge) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.governed_as_debtor_account_by);
    const _from = accountEntityId;
    const _to = conditionId;

    return await db?.save(
      {
        _from,
        _to,
        evtTp: conditionEdge.evtTp,
        incptnDtTm: conditionEdge.incptnDtTm,
        xprtnDtTm: conditionEdge?.xprtnDtTm,
        tenantId: conditionEdge.tenantId,
      },
      { overwriteMode: 'ignore' },
    );
  };

  manager.updateExpiryDateOfDebtorAccountEdges = async (edgeDebtorByKey: string, expireDateTime: string, tenantId: string) => {
    const debtorCollection = manager._pseudonymsDb?.collection(dbPseudonyms.governed_as_debtor_account_by);
    const debtorRecord = (await debtorCollection?.document(edgeDebtorByKey)) as { tenantId: string };

    if (debtorRecord.tenantId !== tenantId) {
      throw new Error(`Unauthorized: Cannot update debtor edge ${edgeDebtorByKey}. Tenant mismatch or record not found.`);
    }

    return await debtorCollection?.update(edgeDebtorByKey, { xprtnDtTm: expireDateTime }, { returnNew: true });
  };

  manager.updateExpiryDateOfCreditorAccountEdges = async (edgeCreditorByKey: string, expireDateTime: string, tenantId: string) => {
    const creditorCollection = manager._pseudonymsDb?.collection(dbPseudonyms.governed_as_creditor_account_by);
    const creditorRecord = (await creditorCollection?.document(edgeCreditorByKey)) as { tenantId: string };

    if (creditorRecord.tenantId !== tenantId) {
      throw new Error(`Unauthorized: Cannot update creditor edge ${edgeCreditorByKey}. Tenant mismatch or record not found.`);
    }

    return await creditorCollection?.update(edgeCreditorByKey, { xprtnDtTm: expireDateTime }, { returnNew: true });
  };

  manager.updateExpiryDateOfDebtorEntityEdges = async (edgeDebtorByKey: string, expireDateTime: string, tenantId: string) => {
    const debtorCollection = manager._pseudonymsDb?.collection(dbPseudonyms.governed_as_debtor_by);
    const debtorRecord = (await debtorCollection?.document(edgeDebtorByKey)) as { tenantId: string };

    if (debtorRecord.tenantId !== tenantId) {
      throw new Error(`Unauthorized: Cannot update debtor edge ${edgeDebtorByKey}. Tenant mismatch or record not found.`);
    }

    return await debtorCollection?.update(edgeDebtorByKey, { xprtnDtTm: expireDateTime }, { returnNew: true });
  };

  manager.updateExpiryDateOfCreditorEntityEdges = async (edgeCreditorByKey: string, expireDateTime: string, tenantId: string) => {
    const creditorCollection = manager._pseudonymsDb?.collection(dbPseudonyms.governed_as_creditor_by);
    const creditorRecord = (await creditorCollection?.document(edgeCreditorByKey)) as { tenantId: string };

    if (creditorRecord.tenantId !== tenantId) {
      throw new Error(`Unauthorized: Cannot update creditor edge ${edgeCreditorByKey}. Tenant mismatch or record not found.`);
    }

    return await creditorCollection?.update(edgeCreditorByKey, { xprtnDtTm: expireDateTime }, { returnNew: true });
  };

  manager.updateCondition = async (conditionId: string, expireDateTime: string, tenantId: string) => {
    const db = manager._pseudonymsDb?.collection(dbPseudonyms.conditions);
    const condition = (await db?.document(conditionId)) as { tenantId: string } | undefined;

    if (!condition || condition.tenantId !== tenantId) {
      throw new Error(`Unauthorized: Cannot update condition ${conditionId}. Tenant mismatch or record not found.`);
    }

    return await db?.update(conditionId, { xprtnDtTm: expireDateTime }, { returnNew: true });
  };
}
