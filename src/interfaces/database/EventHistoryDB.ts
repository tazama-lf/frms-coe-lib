// SPDX-License-Identifier: Apache-2.0

import type { Pool } from 'pg';
import type { AccountCondition, ConditionEdge, EntityCondition, TransactionRelationship } from '..';
import type { Account, Edge, Entity, RawConditionResponse } from '../event-flow/EntityConditionEdge';
import type { Condition } from '../event-flow/Condition';

export interface EventHistoryDB {
  _eventHistory: Pool;

  /**
   * @param {TransactionRelationship} tR TransactionRelationship Object
   *
   * This is a insert query to the transactionRelationship collection with overwrite mode set to `ignore`
   * @memberof EventHistoryDB
   */
  saveTransactionRelationship: (tR: TransactionRelationship) => Promise<void>;

  /**
   * @param key string account identifier we are storing
   *
   * @memberof EventHistoryDB
   */
  saveAccount: (key: string) => Promise<void>;

  /**
   * @param entityId string entity identifier we are storing
   * @param CreDtTm string timestamp
   *
   * @memberof EventHistoryDB
   */
  saveEntity: (entityId: string, CreDtTm: string) => Promise<void>;

  /**
   * @param entityId string entity identifier we are storing
   * @param accountId string account identifier we are storing
   * @param CreDtTm string timestamp
   *
   * @memberof EventHistoryDB
   */
  saveAccountHolder: (entityId: string, accountId: string, CreDtTm: string) => Promise<void>;

  /**
   * @param condition condition object we are storing of `EntityCondition` or `AccountCondition` type
   *
   * @memberof EventHistoryDB
   */
  saveCondition: (condition: EntityCondition | AccountCondition) => Promise<void>;

  /**
   * @param conditionId string condition identifier we are storing the edge connect
   * @param accountEntityId string account or entity identifier we are storing the edge connect
   * @param conditionEdge condition edge for account or entity to condition
   *
   * @memberof EventHistoryDB
   */
  saveGovernedAsCreditorByEdge: (conditionId: string, accountEntityId: string, conditionEdge: ConditionEdge) => Promise<Edge | undefined>;

  /**
   * @param conditionId string condition identifier we are storing the edge connect
   * @param accountEntityId string account or entity identifier we are storing the edge connect
   * @param conditionEdge condition edge for account or entity to condition
   *
   * @memberof EventHistoryDB
   */
  saveGovernedAsDebtorByEdge: (conditionId: string, accountEntityId: string, conditionEdge: ConditionEdge) => Promise<Edge | undefined>;
  /**
   * @param conditionId string condition identifier we are storing the edge connect
   * @param accountEntityId string account or entity identifier we are storing the edge connect
   * @param conditionEdge condition edge for account or entity to condition
   *
   * @memberof EventHistoryDB
   */
  saveGovernedAsDebtorAccountByEdge: (
    conditionId: string,
    accountEntityId: string,
    conditionEdge: ConditionEdge,
  ) => Promise<Edge | undefined>;

  /**
   * @param conditionId string condition identifier we are storing the edge connect
   * @param accountEntityId string account or entity identifier we are storing the edge connect
   * @param conditionEdge condition edge for account or entity to condition
   *
   * @memberof EventHistoryDB
   */
  saveGovernedAsCreditorAccountByEdge: (
    conditionId: string,
    accountEntityId: string,
    conditionEdge: ConditionEdge,
  ) => Promise<Edge | undefined>;

  /**
   * @param entityId string of identifier for entity being retrieved
   * @param schemeProprietary string of scheme proprietary of the entity being retrieved
   *
   * @memberof EventHistoryDB
   */
  getConditionsByEntity: (entityId: string, schemeProprietary: string) => Promise<EntityCondition[]>;

  /**
   * @param entityId string of identifier for entity being retrieved
   * @param schemeProprietary string of scheme proprietary of the entity being retrieved
   * @param retrieveAll (Optional) boolean to retrieve all conditions or only active ones
   *
   * @memberof EventHistoryDB
   */
  getEntityConditionsByGraph: (entityId: string, schemeProprietary: string, retrieveAll?: boolean) => Promise<RawConditionResponse[][]>;

  /**
   * @param entityId string of identifier for entity being retrieved
   * @param schemeProprietary string of scheme proprietary of the entity being retrieved
   * @param agt agt name
   * @param retrieveAll (Optional) boolean to retrieve all conditions or only active ones
   *
   * @memberof EventHistoryDB
   */
  getAccountConditionsByGraph: (
    entityId: string,
    schemeProprietary: string,
    agt: string,
    retrieveAll?: boolean,
  ) => Promise<RawConditionResponse[][]>;

  /**
   * @param activeOnly Only active conditions
   *
   * @memberof EventHistoryDB
   */
  getConditionsByGraph: (activeOnly: boolean) => Promise<RawConditionResponse[][]>;

  /**
   * @param activeOnly Only active conditions
   *
   * @memberof EventHistoryDB
   */
  getConditions: (activeOnly: boolean) => Promise<Condition[]>;

  /**
   * @param entityId string of identifier for entity being retrieved
   * @param schemeProprietary string of scheme proprietary of the entity being retrieved
   *
   * @memberof EventHistoryDB
   */
  getEntity: (entityId: string, schemeProprietary: string) => Promise<Entity | undefined>;

  /**
   * @param accountId string of identifier for account being retrieved
   * @param schemeProprietary string of scheme proprietary of the account being retrieved
   *
   * @memberof EventHistoryDB
   */
  getAccount: (accountId: string, schemeProprietary: string, agtMemberId: string) => Promise<Account | undefined>;

  /**
   * @param accountId string of identifier for account being retrieved
   * @param schemeProprietary string of scheme proprietary of the account being retrieved
   * @param memberId string of financial institution member id of the account being retrieved
   *
   * @memberof EventHistoryDB
   */
  getConditionsByAccount: (accountId: string, schemeProprietary: string, memberId: string) => Promise<AccountCondition[]>;

  /**
   * @param edgeDebtorByKey string _key of identifier for debtor by edge
   * @param expireDateTime new date to use for expire timedate in edges
   * @param tenantId string tenant identifier for authorization
   *
   * @memberof EventHistoryDB
   */
  updateExpiryDateOfDebtorAccountEdges: (edgeDebtorByKey: string, expireDateTime: string, tenantId: string) => Promise<void>;

  /**
   * @param edgeCreditorByKey string _key of identifier for creditor by edge
   * @param expireDateTime new date to use for expire timedate in edges
   * @param tenantId string tenant identifier for authorization
   *
   * @memberof EventHistoryDB
   */
  updateExpiryDateOfCreditorAccountEdges: (edgeCreditorByKey: string, expireDateTime: string, tenantId: string) => Promise<void>;

  /**
   * @param edgeCreditorByKey string _key of identifier for creditor by edge
   * @param edgeDebtorByKey string _key of identifier for debtor by edge
   * @param expireDateTime new date to use for expire timedate in edges
   * @param tenantId string tenant identifier for authorization
   *
   * @memberof EventHistoryDB
   */
  updateExpiryDateOfDebtorEntityEdges: (
    edgeCreditorByKey: string,
    edgeDebtorByKey: string,
    expireDateTime: string,
    tenantId: string,
  ) => Promise<void>;

  /**
   * @param edgeCreditorByKey string _key of identifier for creditor by edge
   * @param edgeDebtorByKey string _key of identifier for debtor by edge
   * @param expireDateTime new date to use for expire timedate in edges
   * @param tenantId string tenant identifier for authorization
   *
   * @memberof EventHistoryDB
   */
  updateExpiryDateOfCreditorEntityEdges: (
    edgeCreditorByKey: string,
    edgeDebtorByKey: string,
    expireDateTime: string,
    tenantId: string,
  ) => Promise<void>;

  /**
   * @param conditionId string _key of identifier for condition being updated
   * @param expireDateTime new date to use for expire timedate in the condition
   *
   * @memberof EventHistoryDB
   */
  updateCondition: (conditionId: string, expireDateTime: string) => Promise<void>;
}
