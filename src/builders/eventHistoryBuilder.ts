// SPDX-License-Identifier: Apache-2.0

import * as util from 'node:util';
import { Pool, type PoolConfig } from 'pg';
import { isDatabaseReady } from '../builders/utils';
import type { AccountCondition, ConditionEdge, EntityCondition, TransactionDetails } from '../interfaces';
import type { PgQueryConfig } from '../interfaces/database';
import type { Account, Edge, Entity, Condition, RawConditionResponse } from '../interfaces/event-flow/EntityConditionEdge';
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
      text: 'INSERT INTO transaction (source, destination, transaction) VALUES ($1, $2, $3) ON CONFLICT (endToEndId, txTp, tenantId) DO NOTHING',
      values: [td.source, td.destination, td],
    };

    await manager._eventHistory.query(query);
  };

  manager.saveAccount = async (key: string, tenantId: string): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO account (id, tenantId) VALUES ($1, $2) ON CONFLICT (id, tenantId) DO NOTHING',
      values: [key, tenantId],
    };

    await manager._eventHistory.query(query);
  };

  manager.saveEntity = async (entityId: string, tenantId: string, CreDtTm: string): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO entity (id, tenantId, creDtTm) VALUES ($1, $2, $3) ON CONFLICT (id, tenantId) DO NOTHING',
      values: [entityId, tenantId, CreDtTm],
    };

    await manager._eventHistory.query(query);
  };

  manager.saveAccountHolder = async (entityId: string, accountId: string, CreDtTm: string, tenantId: string): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO account_holder (source, destination, creDtTm, tenantId) VALUES ($1, $2, $3, $4) ON CONFLICT (source, destination, tenantId) DO NOTHING',
      values: [entityId, accountId, CreDtTm, tenantId],
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
              (source, destination, evtTp, incptnDtTm, xprtnDtTm, tenantId)
            VALUES
              ($1, $2, $3, $4, $5, $6)
            ON CONFLICT 
              (source, destination, tenantId) DO NOTHING
            RETURNING *`,
      values: [
        accountEntityId,
        conditionId,
        conditionEdge.evtTp,
        conditionEdge.incptnDtTm,
        conditionEdge.xprtnDtTm,
        conditionEdge.tenantId,
      ],
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
              (source, destination, evtTp, incptnDtTm, xprtnDtTm, tenantId)
            VALUES
              ($1, $2, $3, $4, $5, $6)
            ON CONFLICT 
              (source, destination, tenantId) DO NOTHING
            RETURNING *`,
      values: [
        accountEntityId,
        conditionId,
        conditionEdge.evtTp,
        conditionEdge.incptnDtTm,
        conditionEdge.xprtnDtTm,
        conditionEdge.tenantId,
      ],
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
              (source, destination, evtTp, incptnDtTm, xprtnDtTm, tenantId)
            VALUES
              ($1, $2, $3, $4, $5, $6)
            ON CONFLICT 
              (source, destination, tenantId) DO NOTHING
            RETURNING *`,
      values: [
        accountEntityId,
        conditionId,
        conditionEdge.evtTp,
        conditionEdge.incptnDtTm,
        conditionEdge.xprtnDtTm,
        conditionEdge.tenantId,
      ],
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
              (source, destination, evtTp, incptnDtTm, xprtnDtTm, tenantId)
            VALUES
              ($1, $2, $3, $4, $5, $6)
            ON CONFLICT 
              (source, destination, tenantId) DO NOTHING
            RETURNING *`,
      values: [
        accountEntityId,
        conditionId,
        conditionEdge.evtTp,
        conditionEdge.incptnDtTm,
        conditionEdge.xprtnDtTm,
        conditionEdge.tenantId,
      ],
    };

    const queryRes = await manager._eventHistory.query<Edge>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

    return toReturn;
  };

  manager.getConditions = async (activeOnly: boolean, tenantId: string): Promise<Condition[]> => {
    const now = new Date().toISOString();
    let toFilter = '$1::text IS NULL';

    if (activeOnly) {
      toFilter = `
        (condition #>> '{xprtnDtTm}')::timestamp > $2`;
    }

    const query: PgQueryConfig = {
      text: `
        SELECT
          condition
        FROM
          condition
        WHERE
          ${toFilter}
        AND tenantId = $1`,
      values: activeOnly ? [tenantId, now] : [tenantId],
    };

    const queryRes = await manager._eventHistory.query<{ condition: Condition }>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows.map((value) => value.condition) : [];

    return toReturn;
  };

  manager.getEntity = async (entityId: string, schemeProprietary: string, tenantId: string): Promise<Entity | undefined> => {
    const id = `${entityId}${schemeProprietary}`;
    const query: PgQueryConfig = {
      text: 'SELECT id, creDtTm, tenantId FROM entity WHERE id = $1 AND tenantId = $2',
      values: [id, tenantId],
    };

    const queryRes = await manager._eventHistory.query<Entity>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

    return toReturn;
  };

  manager.getAccount = async (
    accountId: string,
    schemeProprietary: string,
    agtMemberId: string,
    tenantId: string,
  ): Promise<Account | undefined> => {
    const id = `${accountId}${schemeProprietary}${agtMemberId}`;
    const query: PgQueryConfig = {
      text: 'SELECT id, tenantId FROM account WHERE id = $1 AND tenantId = $2',
      values: [id, tenantId],
    };

    const queryRes = await manager._eventHistory.query<Account>(query);
    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

    return toReturn;
  };

  manager.updateExpiryDateOfDebtorAccountEdges = async (
    source: string,
    destination: string,
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
          source = $2
        AND
          destination = $3
        AND 
          tenantId = $4`,
      values: [expireDateTime, source, destination, tenantId],
    };

    await manager._eventHistory.query(query);
  };

  manager.updateExpiryDateOfCreditorAccountEdges = async (
    source: string,
    destination: string,
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
          source = $2
        AND
          destination = $3
        AND 
          tenantId = $4`,
      values: [expireDateTime, source, destination, tenantId],
    };

    await manager._eventHistory.query(query);
  };

  manager.updateExpiryDateOfDebtorEntityEdges = async (
    source: string,
    destination: string,
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
          source = $2
        AND
          destination = $3
        AND 
          tenantId = $4`,
      values: [expireDateTime, source, destination, tenantId],
    };

    await manager._eventHistory.query(query);
  };

  manager.updateExpiryDateOfCreditorEntityEdges = async (
    source: string,
    destination: string,
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
          source = $2
        AND
          destination = $3
        AND 
          tenantId = $4`,
      values: [expireDateTime, source, destination, tenantId],
    };

    await manager._eventHistory.query(query);
  };

  manager.updateCondition = async (conditionId: string, expireDateTime: string, tenantId: string): Promise<void> => {
    const query: PgQueryConfig = {
      text: `
        UPDATE 
          condition
        SET 
          condition = jsonb_set(condition, '{xprtnDtTm}', to_jsonb($1::text), true)
        WHERE 
          id = $2
        AND
          tenantId = $3`,
      values: [expireDateTime, conditionId, tenantId],
    };

    await manager._eventHistory.query(query);
  };

  manager.getEntityConditionsByGraph = async (
    entityId: string,
    schemeProprietary: string,
    tenantId: string,
    retrieveAll?: boolean,
  ): Promise<RawConditionResponse[]> => {
    const query: PgQueryConfig = {
      text: `
        WITH gov_cred AS (
          SELECT 
              e.* AS edge,
              f.* AS result,
              t.* AS condition
          FROM governed_as_creditor_by e
          JOIN entity   f ON f.id = e.source
          JOIN "condition" t ON t.id = e.destination
          WHERE t.condition->'ntty'->>'id' = $1
          AND t.condition->'ntty'->'schmeNm'->>'prtry' = $2
          AND (
              $3::boolean = TRUE
              OR (
                  (t.condition #>> '{incptnDtTm}')::timestamptz < NOW()
                  AND (
                      (t.condition #>> '{xprtnDtTm}')::timestamptz > NOW()
                      OR (t.condition #>> '{xprtnDtTm}') IS NULL
                  )
                  AND e."incptndttm"::timestamptz < NOW()
                  AND (e."xprtndttm"::timestamptz > NOW() OR e."xprtndttm" IS NULL)
              )
            )
          AND e.tenantId = $4
        ),
        gov_debtor AS (
            SELECT 
                e.* AS edge,
                f.* AS result,
                t.* AS condition
            FROM governed_as_debtor_by e
            JOIN entity   f ON f.id = e.source
            JOIN "condition" t ON t.id = e.destination
            WHERE t.condition->'ntty'->>'id' = $1
              AND t.condition->'ntty'->'schmeNm'->>'prtry' = $2
              AND (
                  $3::boolean = TRUE
                  OR (
                      (t.condition #>> '{incptnDtTm}')::timestamptz < NOW()
                      AND (
                           (t.condition #>> '{xprtnDtTm}')::timestamptz > NOW()
                           OR (t.condition #>> '{xprtnDtTm}') IS NULL
                      )
                      AND e."incptndttm"::timestamptz < NOW()
                      AND (e."xprtndttm"::timestamptz > NOW() OR e."xprtndttm" IS NULL)
                  )
              )
            AND e.tenantId = $4
        )
        SELECT jsonb_build_object(
            'governed_as_creditor_by',
              COALESCE((SELECT jsonb_agg(g) FROM gov_cred AS g), '[]'::jsonb),
            'governed_as_debtor_by',
              COALESCE((SELECT jsonb_agg(d) FROM gov_debtor AS d), '[]'::jsonb)
        ) AS result_gov;`,
      values: [entityId, schemeProprietary, retrieveAll, tenantId],
    };

    const queryRes = await manager._eventHistory.query<{ result_gov: RawConditionResponse }>(query);
    return queryRes.rows.map((eachEntry) => ({
      governed_as_creditor_by: eachEntry.result_gov.governed_as_creditor_by,
      governed_as_debtor_by: eachEntry.result_gov.governed_as_debtor_by,
    })) as RawConditionResponse[];
  };

  manager.getAccountConditionsByGraph = async (
    entityId: string,
    schemeProprietary: string,
    tenantId: string,
    agt: string,
    retrieveAll?: boolean,
  ): Promise<RawConditionResponse[]> => {
    const query: PgQueryConfig = {
      text: `
        WITH gov_cred AS (
            SELECT 
                e.* AS edge,
                f.* AS result,
                t.* AS condition
            FROM governed_as_creditor_account_by e
            JOIN account f ON f.id = e.source
            JOIN condition t ON t.id = e.destination
            WHERE t.condition->'acct'->>'id' = $1
              AND t.condition->'acct'->'schmeNm'->>'prtry' = $2
              AND t.condition->'acct'->'agt'->'finInstnId'->'clrSysMmbId'->>'mmbId' = $3
              AND (
                  $4::boolean = TRUE 
                  OR (
                      (t.condition #>> '{incptnDtTm}')::timestamptz < NOW()  
                      AND ((t.condition #>> '{xprtnDtTm}')::timestamptz > NOW() OR (t.condition #>> '{xprtnDtTm}') IS NULL)
                      AND e."incptndttm"::timestamptz < NOW()
                      AND (e."xprtndttm"::timestamptz > NOW() OR e."xprtndttm" IS NULL)
                  )
              )
            AND e.tenantId = $5
        ),
        gov_debtor AS (
            SELECT 
                e.* AS edge,
                f.* AS result,
                t.* AS condition
            FROM governed_as_debtor_account_by e
            JOIN account f ON f.id = e.source
            JOIN condition t ON t.id = e.destination
            WHERE t.condition->'acct'->>'id' = $1
              AND t.condition->'acct'->'schmeNm'->>'prtry' = $2
              AND t.condition->'acct'->'agt'->'finInstnId'->'clrSysMmbId'->>'mmbId' = $3
              AND (
                  $4::boolean = TRUE 
                  OR (
                      (t.condition #>> '{incptnDtTm}')::timestamptz < NOW() 
                      AND ((t.condition #>> '{xprtnDtTm}')::timestamptz > NOW() OR (t.condition #>> '{xprtnDtTm}') IS NULL)
                      AND e."incptndttm"::timestamptz < NOW()
                      AND (e."xprtndttm"::timestamptz > NOW() OR e."xprtndttm" IS NULL) 
                  )
              )
            AND e.tenantId = $5
        )
        SELECT jsonb_build_object(
            'governed_as_creditor_account_by',
              COALESCE((SELECT jsonb_agg(g) FROM gov_cred AS g), '[]'::jsonb),
            'governed_as_debtor_account_by',
              COALESCE((SELECT jsonb_agg(d) FROM gov_debtor AS d), '[]'::jsonb)
        ) AS result_gov;`,
      values: [entityId, schemeProprietary, agt, retrieveAll, tenantId],
    };
    const queryRes = await manager._eventHistory.query<{ result_gov: RawConditionResponse }>(query);
    return queryRes.rows.map((eachEntry) => ({
      governed_as_creditor_account_by: eachEntry.result_gov.governed_as_creditor_account_by,
      governed_as_debtor_account_by: eachEntry.result_gov.governed_as_debtor_account_by,
    })) as RawConditionResponse[];
  };
}
