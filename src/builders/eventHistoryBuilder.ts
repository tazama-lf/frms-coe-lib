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
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [td.TenantId]);

      const query: PgQueryConfig = {
        text: 'INSERT INTO transaction (source, destination, transaction) VALUES ($1, $2, $3) ON CONFLICT (endToEndId, txTp, tenantId) DO NOTHING',
        values: [td.source, td.destination, td],
      };

      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveAccount = async (key: string, tenantId: string): Promise<void> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);

      const query: PgQueryConfig = {
        text: 'INSERT INTO account (id) VALUES ($1) ON CONFLICT (id, tenantId) DO NOTHING',
        values: [key],
      };
      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveEntity = async (entityId: string, tenantId: string, CreDtTm: string): Promise<void> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);

      const query: PgQueryConfig = {
        text: 'INSERT INTO entity (id, creDtTm) VALUES ($1, $2) ON CONFLICT (id, tenantId) DO NOTHING',
        values: [entityId, CreDtTm],
      };
      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveAccountHolder = async (entityId: string, accountId: string, CreDtTm: string, tenantId: string): Promise<void> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);

      const query: PgQueryConfig = {
        text: 'INSERT INTO account_holder (source, destination, creDtTm) VALUES ($1, $2, $3) ON CONFLICT (source, destination, tenantId) DO NOTHING',
        values: [entityId, accountId, CreDtTm],
      };
      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveCondition = async (condition: EntityCondition | AccountCondition): Promise<void> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [condition.tenantId]);

      const query: PgQueryConfig = {
        text: 'INSERT INTO condition (condition) VALUES ($1)',
        values: [condition],
      };
      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveGovernedAsCreditorByEdge = async (
    conditionId: string,
    accountEntityId: string,
    conditionEdge: ConditionEdge,
  ): Promise<Edge | undefined> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [conditionEdge.tenantId]);

      const query: PgQueryConfig = {
        text: `INSERT INTO governed_as_creditor_by
              (source, destination, evtTp, incptnDtTm, xprtnDtTm)
            VALUES
              ($1, $2, $3, $4, $5)
            ON CONFLICT
              (source, destination, tenantId) DO NOTHING
            RETURNING *`,
        values: [accountEntityId, conditionId, conditionEdge.evtTp, conditionEdge.incptnDtTm, conditionEdge.xprtnDtTm],
      };

      const queryRes = await client.query<Edge>(query);
      await client.query('COMMIT');
      const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

      return toReturn;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveGovernedAsDebtorByEdge = async (
    conditionId: string,
    accountEntityId: string,
    conditionEdge: ConditionEdge,
  ): Promise<Edge | undefined> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [conditionEdge.tenantId]);

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

      const queryRes = await client.query<Edge>(query);
      await client.query('COMMIT');
      const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

      return toReturn;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveGovernedAsDebtorAccountByEdge = async (
    conditionId: string,
    accountEntityId: string,
    conditionEdge: ConditionEdge,
  ): Promise<Edge | undefined> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [conditionEdge.tenantId]);

      const query: PgQueryConfig = {
        text: `INSERT INTO governed_as_debtor_account_by
              (source, destination, evtTp, incptnDtTm, xprtnDtTm)
            VALUES
              ($1, $2, $3, $4, $5, $6)
            ON CONFLICT
              (source, destination, tenantId) DO NOTHING
            RETURNING *`,
        values: [accountEntityId, conditionId, conditionEdge.evtTp, conditionEdge.incptnDtTm, conditionEdge.xprtnDtTm],
      };

      const queryRes = await client.query<Edge>(query);
      await client.query('COMMIT');
      const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

      return toReturn;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.saveGovernedAsCreditorAccountByEdge = async (
    conditionId: string,
    accountEntityId: string,
    conditionEdge: ConditionEdge,
  ): Promise<Edge | undefined> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [conditionEdge.tenantId]);

      const query: PgQueryConfig = {
        text: `INSERT INTO governed_as_creditor_account_by
              (source, destination, evtTp, incptnDtTm, xprtnDtTm)
            VALUES
              ($1, $2, $3, $4, $5)
            ON CONFLICT
              (source, destination, tenantId) DO NOTHING
            RETURNING *`,
        values: [accountEntityId, conditionId, conditionEdge.evtTp, conditionEdge.incptnDtTm, conditionEdge.xprtnDtTm],
      };
      const queryRes = await client.query<Edge>(query);
      await client.query('COMMIT');
      const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;
      return toReturn;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.getConditions = async (activeOnly: boolean, tenantId: string): Promise<Condition[]> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
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

      const queryRes = await client.query<{ condition: Condition }>(query);
      await client.query('COMMIT');
      const toReturn = queryRes.rows.length > 0 ? queryRes.rows.map((value) => value.condition) : [];

      return toReturn;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.getEntity = async (entityId: string, schemeProprietary: string, tenantId: string): Promise<Entity | undefined> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
      const id = `${entityId}${schemeProprietary}`;
      const query: PgQueryConfig = {
        text: 'SELECT id, creDtTm, tenantId FROM entity WHERE id = $1',
        values: [id],
      };

      const queryRes = await client.query<Entity>(query);
      await client.query('COMMIT');
      const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

      return toReturn;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.getAccount = async (
    accountId: string,
    schemeProprietary: string,
    agtMemberId: string,
    tenantId: string,
  ): Promise<Account | undefined> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
      const id = `${accountId}${schemeProprietary}${agtMemberId}`;
      const query: PgQueryConfig = {
        text: 'SELECT id, tenantId FROM account WHERE id = $1',
        values: [id],
      };

      const queryRes = await client.query<Account>(query);
      await client.query('COMMIT');
      const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;

      return toReturn;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.updateExpiryDateOfDebtorAccountEdges = async (
    source: string,
    destination: string,
    expireDateTime: string,
    tenantId: string,
  ): Promise<void> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
      const query: PgQueryConfig = {
        text: `
        UPDATE
          governed_as_debtor_account_by
        SET
          xprtnDtTm = $1
        WHERE
          source = $2
        AND
          destination = $3`,
        values: [expireDateTime, source, destination],
      };

      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.updateExpiryDateOfCreditorAccountEdges = async (
    source: string,
    destination: string,
    expireDateTime: string,
    tenantId: string,
  ): Promise<void> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
      const query: PgQueryConfig = {
        text: `
        UPDATE
          governed_as_creditor_account_by
        SET
          xprtnDtTm = $1
        WHERE
          source = $2
        AND
          destination = $3`,
        values: [expireDateTime, source, destination],
      };

      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.updateExpiryDateOfDebtorEntityEdges = async (
    source: string,
    destination: string,
    expireDateTime: string,
    tenantId: string,
  ): Promise<void> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
      const query: PgQueryConfig = {
        text: `
        UPDATE
          governed_as_debtor_by
        SET
          xprtnDtTm = $1
        WHERE
          source = $2
        AND
          destination = $3`,
        values: [expireDateTime, source, destination],
      };

      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.updateExpiryDateOfCreditorEntityEdges = async (
    source: string,
    destination: string,
    expireDateTime: string,
    tenantId: string,
  ): Promise<void> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
      const query: PgQueryConfig = {
        text: `
        UPDATE
          governed_as_creditor_by
        SET
          xprtnDtTm = $1
        WHERE
          source = $2
        AND
          destination = $3`,
        values: [expireDateTime, source, destination],
      };
      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.updateCondition = async (conditionId: string, expireDateTime: string, tenantId: string): Promise<void> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
      const query: PgQueryConfig = {
        text: `
        UPDATE
          condition
        SET
          condition = jsonb_set(condition, '{xprtnDtTm}', to_jsonb($1::text), true)
        WHERE
          id = $2`,
        values: [expireDateTime, conditionId],
      };
      await client.query(query);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.getEntityConditionsByGraph = async (
    entityId: string,
    schemeProprietary: string,
    tenantId: string,
    retrieveAll?: boolean,
  ): Promise<RawConditionResponse[]> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
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
        )
        SELECT jsonb_build_object(
            'governed_as_creditor_by',
              COALESCE((SELECT jsonb_agg(g) FROM gov_cred AS g), '[]'::jsonb),
            'governed_as_debtor_by',
              COALESCE((SELECT jsonb_agg(d) FROM gov_debtor AS d), '[]'::jsonb)
        ) AS result_gov;`,
        values: [entityId, schemeProprietary, retrieveAll],
      };

      const queryRes = await client.query<{ result_gov: RawConditionResponse }>(query);
      await client.query('COMMIT');
      return queryRes.rows.map((eachEntry) => ({
        governed_as_creditor_by: eachEntry.result_gov.governed_as_creditor_by,
        governed_as_debtor_by: eachEntry.result_gov.governed_as_debtor_by,
      })) as RawConditionResponse[];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  manager.getAccountConditionsByGraph = async (
    entityId: string,
    schemeProprietary: string,
    tenantId: string,
    agt: string,
    retrieveAll?: boolean,
  ): Promise<RawConditionResponse[]> => {
    const client = await manager._eventHistory.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT public.set_tenant_id($1)', [tenantId]);
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
        )
        SELECT jsonb_build_object(
            'governed_as_creditor_account_by',
              COALESCE((SELECT jsonb_agg(g) FROM gov_cred AS g), '[]'::jsonb),
            'governed_as_debtor_account_by',
              COALESCE((SELECT jsonb_agg(d) FROM gov_debtor AS d), '[]'::jsonb)
        ) AS result_gov;`,
        values: [entityId, schemeProprietary, agt, retrieveAll],
      };
      const queryRes = await client.query<{ result_gov: RawConditionResponse }>(query);
      await client.query('COMMIT');
      return queryRes.rows.map((eachEntry) => ({
        governed_as_creditor_account_by: eachEntry.result_gov.governed_as_creditor_account_by,
        governed_as_debtor_account_by: eachEntry.result_gov.governed_as_debtor_account_by,
      })) as RawConditionResponse[];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };
}
