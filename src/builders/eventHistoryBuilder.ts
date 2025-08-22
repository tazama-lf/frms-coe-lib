// SPDX-License-Identifier: Apache-2.0

import * as util from 'node:util';
import { Pool, type PoolConfig } from 'pg';
import { isDatabaseReady } from '../builders/utils';
import type { AccountCondition, ConditionEdge, EntityCondition, TransactionDetails } from '../interfaces';
import type { PgQueryConfig } from '../interfaces/database';
import type { Account, Edge, Entity, Condition } from '../interfaces/event-flow/EntityConditionEdge';
import type { DBConfig, EventHistoryDB } from '../services/dbManager';
import { readyChecks } from '../services/dbManager';
import { getSSLConfig } from './utils';

export async function eventHistoryBuilder(manager: EventHistoryDB, eventHistoryConfig: DBConfig): Promise<void> {
  const conf: PoolConfig = {
    host: eventHistoryConfig.host,
    port: eventHistoryConfig.port,
    database: eventHistoryConfig.databaseName,
    user: eventHistoryConfig.user,
    password: eventHistoryConfig.password,
    ssl: getSSLConfig(eventHistoryConfig.certPath),
  } as const;

  manager._eventHistory = new Pool(conf);

  try {
    const dbReady = await isDatabaseReady(manager._eventHistory);
    readyChecks.EventHistoryDB = dbReady ? 'Ok' : 'err';
  } catch (error) {
    const err = error as Error;
    readyChecks.EventHistoryDB = `err, ${util.inspect(err)}`;
  }

  manager.saveTransactionDetails = async (td: TransactionDetails): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO transaction (source, destination, transaction) VALUES ($1, $2, $3)',
      values: [td.source, td.destination, td],
    };

    await manager._eventHistory.query(query);
  };

  manager.saveAccount = async (key: string): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO account (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
      values: [key],
    };

    await manager._eventHistory.query(query);
  };

  manager.saveEntity = async (entityId: string, CreDtTm: string): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO entity (id, creDtTm) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
      values: [entityId, CreDtTm],
    };

    await manager._eventHistory.query(query);
  };

  manager.saveAccountHolder = async (entityId: string, accountId: string, CreDtTm: string): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO account_holder (source, destination, creDtTm) VALUES ($1, $2, $3) ON CONFLICT (source, destination) DO NOTHING',
      values: [entityId, accountId, CreDtTm],
    };

    await manager._eventHistory.query(query);
  };

  manager.saveCondition = async (condition: EntityCondition | AccountCondition): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO condition (condition) VALUES ($1)',
      values: [condition],
    };

    await manager._eventHistory.query(query);
  };

  manager.saveGovernedAsCreditorByEdge = async (
    conditionId: string,
    accountEntityId: string,
    conditionEdge: ConditionEdge,
  ): Promise<Edge | undefined> => {
    const query: PgQueryConfig = {
      text: `INSERT INTO governed_as_creditor_by
              (source, destination, evtTp, incptnDtTm, xprtnDtTm)
            VALUES
              ($1, $2, $3, $4, $5)
            ON CONFLICT 
              (source, destination) DO NOTHING
            RETURNING *`,
      values: [accountEntityId, conditionId, conditionEdge.evtTp, conditionEdge.incptnDtTm, conditionEdge.xprtnDtTm],
    };

    const queryRes = await manager._eventHistory.query<Edge>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

    return toReturn;
  };

  manager.saveGovernedAsDebtorByEdge = async (
    conditionId: string,
    accountEntityId: string,
    conditionEdge: ConditionEdge,
  ): Promise<Edge | undefined> => {
    const query: PgQueryConfig = {
      text: `INSERT INTO governed_as_debtor_by
              (source, destination, evtTp, incptnDtTm, xprtnDtTm)
            VALUES
              ($1, $2, $3, $4, $5)
            ON CONFLICT 
              (source, destination) DO NOTHING
            RETURNING *`,
      values: [accountEntityId, conditionId, conditionEdge.evtTp, conditionEdge.incptnDtTm, conditionEdge.xprtnDtTm],
    };

    const queryRes = await manager._eventHistory.query<Edge>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

    return toReturn;
  };

  manager.saveGovernedAsDebtorAccountByEdge = async (
    conditionId: string,
    accountEntityId: string,
    conditionEdge: ConditionEdge,
  ): Promise<Edge | undefined> => {
    const query: PgQueryConfig = {
      text: `INSERT INTO governed_as_debtor_account_by
              (source, destination, evtTp, incptnDtTm, xprtnDtTm)
            VALUES
              ($1, $2, $3, $4, $5)
            ON CONFLICT 
              (source, destination) DO NOTHING
            RETURNING *`,
      values: [accountEntityId, conditionId, conditionEdge.evtTp, conditionEdge.incptnDtTm, conditionEdge.xprtnDtTm],
    };

    const queryRes = await manager._eventHistory.query<Edge>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

    return toReturn;
  };

  manager.saveGovernedAsCreditorAccountByEdge = async (
    conditionId: string,
    accountEntityId: string,
    conditionEdge: ConditionEdge,
  ): Promise<Edge | undefined> => {
    const query: PgQueryConfig = {
      text: `INSERT INTO governed_as_creditor_account_by
              (source, destination, evtTp, incptnDtTm, xprtnDtTm)
            VALUES
              ($1, $2, $3, $4, $5)
            ON CONFLICT 
              (source, destination) DO NOTHING
            RETURNING *`,
      values: [accountEntityId, conditionId, conditionEdge.evtTp, conditionEdge.incptnDtTm, conditionEdge.xprtnDtTm],
    };

    const queryRes = await manager._eventHistory.query<Edge>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

    return toReturn;
  };

  manager.getConditionsByEntity = async (entityId: string, schemeProprietary: string): Promise<EntityCondition[]> => {
    const now = new Date().toISOString();

    const query: PgQueryConfig = {
      text: `SELECT
              condition
            FROM
              condition
            WHERE
              id = $1
            AND
              (condition #>> '{xprtnDtTm}')::timestamp > $2
            AND
              (condition #>> '{ntty,schmeNm,prtry}')::text = $3`,
      values: [entityId, now, schemeProprietary],
    };

    const queryRes = await manager._eventHistory.query<{ condition: EntityCondition }>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows.map((value) => value.condition) : [];

    return toReturn;
  };

  manager.getConditions = async (activeOnly: boolean): Promise<Condition[]> => {
    const now = new Date().toISOString();
    let toFilter = '$1::text IS NULL';

    if (activeOnly) {
      toFilter = `
        (condition #>> '{xprtnDtTm}')::timestamp > $1`;
    }

    const query: PgQueryConfig = {
      text: `
        SELECT
          condition
        FROM
          condition
        WHERE
          ${toFilter}`,
      values: [activeOnly ? now : undefined],
    };

    const queryRes = await manager._eventHistory.query<{ condition: Condition }>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows.map((value) => value.condition) : [];

    return toReturn;
  };

  manager.getEntity = async (entityId: string, schemeProprietary: string): Promise<Entity | undefined> => {
    const id = `${entityId}${schemeProprietary}`;
    const query: PgQueryConfig = {
      text: 'SELECT id, creDtTm FROM entity WHERE id = $1',
      values: [id],
    };

    const queryRes = await manager._eventHistory.query<Entity>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

    return toReturn;
  };

  manager.getAccount = async (accountId: string, schemeProprietary: string, agtMemberId: string): Promise<Account | undefined> => {
    const id = `${accountId}${schemeProprietary}${agtMemberId}`;
    const query: PgQueryConfig = {
      text: 'SELECT id FROM account WHERE id = $1',
      values: [id],
    };

    const queryRes = await manager._eventHistory.query<Account>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

    return toReturn;
  };

  manager.getConditionsByAccount = async (accountId: string, schemeProprietary: string, memberId: string): Promise<AccountCondition[]> => {
    const now = new Date().toISOString();
    const query: PgQueryConfig = {
      text: `
        SELECT
          condition
        FROM
          condition
        WHERE
          (condition #>> '{acct,id}')::text = $1
        AND
          (condition #>> '{acct,schmeNm,prtry}')::text = $2
        AND
          (condition #>> '{acct,agt,finInstnId,clrSysMmbId,mmbId}')::text = $3
        AND 
          (
            (condition #>> '{xprtnDtTm}')::timestamp IS NULL
          OR
            (condition #>> '{xprtnDtTm}')::timestamp > $4
          )
      }`,
      values: [accountId, schemeProprietary, memberId, now],
    };

    const queryRes = await manager._eventHistory.query<{ condition: AccountCondition }>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows.map((value) => value.condition) : [];

    return toReturn;
  };

  manager.updateExpiryDateOfDebtorAccountEdges = async (
    edgeDebtorByKey: string,
    expireDateTime: string,
    tenantId: string,
  ): Promise<void> => {
    const query: PgQueryConfig = {
      text: `
        UPDATE
          governed_as_debtor_account_by
        SET
          xprtnDtTm = $1
        WHERE
          id = $2
      `, // AND tenantId = $3
      values: [expireDateTime, edgeDebtorByKey],
    };

    await manager._eventHistory.query(query);
  };

  manager.updateExpiryDateOfCreditorAccountEdges = async (
    edgeCreditorByKey: string,
    expireDateTime: string,
    tenantId: string,
  ): Promise<void> => {
    const query: PgQueryConfig = {
      text: `
        UPDATE
          governed_as_creditor_account_by
        SET
          xprtnDtTm = $1
        WHERE
          id = $2
      `, // AND tenantId = $3
      values: [expireDateTime, edgeCreditorByKey],
    };

    await manager._eventHistory.query(query);
  };

  manager.updateExpiryDateOfDebtorEntityEdges = async (
    edgeDebtorByKey: string,
    expireDateTime: string,
    tenantId: string,
  ): Promise<void> => {
    const query: PgQueryConfig = {
      text: `
        UPDATE
          governed_as_debtor_by
        SET
          xprtnDtTm = $1
        WHERE
          id = $2
      `, // AND tenantId = $3
      values: [expireDateTime, edgeDebtorByKey],
    };

    await manager._eventHistory.query(query);
  };

  manager.updateExpiryDateOfCreditorEntityEdges = async (
    edgeCreditorByKey: string,
    expireDateTime: string,
    tenantId: string,
  ): Promise<void> => {
    const query: PgQueryConfig = {
      text: `
        UPDATE
          governed_as_creditor_by
        SET
          xprtnDtTm = $1
        WHERE
          id = $2
      `, // AND tenantId = $3
      values: [expireDateTime, edgeCreditorByKey],
    };

    await manager._eventHistory.query(query);
  };

  manager.updateCondition = async (conditionId: string, expireDateTime: string): Promise<void> => {
    const query: PgQueryConfig = {
      text: `
        UPDATE
          conditions
        SET
          xprtnDtTm = $1
        WHERE
          condId = $2`,
      values: [expireDateTime, conditionId],
    };

    await manager._eventHistory.query(query);
  };
}
