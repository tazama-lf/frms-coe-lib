// SPDX-License-Identifier: Apache-2.0

import type { Pool } from 'pg';
import type { AccountCondition, ConditionEdge, EntityCondition, TransactionDetails } from '..';
import type { Account, Edge, Entity, RawConditionResponse, Condition } from '../event-flow/EntityConditionEdge';

export interface EventHistoryDB {
  _eventHistory: Pool;

  /**
   * @param {TransactionDetails} td TransactionDetails Object
   *
   * This is a insert query to the tranaction collection with overwrite mode set to `ignore`
   * @memberof EventHistoryDB
   */
  saveTransactionDetails: (td: TransactionDetails) => Promise<void>;

  /**
   * @param key string account identifier we are storing
   * @param tenantId The tenantId String to filter on the TenantId field
   *
   * @memberof EventHistoryDB
   */
  saveAccount: (key: string, tenantId: string) => Promise<void>;

  /**
   * @param entityId string entity identifier we are storing
   * @param tenantId The tenantId String to filter on the TenantId field
   * @param CreDtTm string timestamp
   *
   * @memberof EventHistoryDB
   */
  saveEntity: (entityId: string, tenantId: string, CreDtTm: string) => Promise<void>;

  /**
   * @param entityId string entity identifier we are storing
   * @param accountId string account identifier we are storing
   * @param CreDtTm string timestamp
   * @param tenantId The tenantId String to filter on the TenantId field
   *
   * @memberof EventHistoryDB
   */
  saveAccountHolder: (entityId: string, accountId: string, CreDtTm: string, tenantId: string) => Promise<void>;

  /**
   * @param condition condition object we are storing of `EntityCondition` or `AccountCondition` type
   * @throws {Error} if condId already exists
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
   * @param tenantId The tenantId String to filter on the TenantId field
   * @param retrieveAll (Optional) boolean to retrieve all conditions or only active ones
   *
   * @memberof EventHistoryDB
   */
  getEntityConditionsByGraph: (
    entityId: string,
    schemeProprietary: string,
    tenantId: string,
    retrieveAll?: boolean,
  ) => Promise<RawConditionResponse[]>;

  /**
   * @param entityId string of identifier for entity being retrieved
   * @param schemeProprietary string of scheme proprietary of the entity being retrieved
   * @param tenantId The tenantId String to filter on the TenantId field
   * @param agt agt name
   * @param retrieveAll (Optional) boolean to retrieve all conditions or only active ones
   *
   * @memberof EventHistoryDB
   */
  getAccountConditionsByGraph: (
    entityId: string,
    schemeProprietary: string,
    tenantId: string,
    agt: string,
    retrieveAll?: boolean,
  ) => Promise<RawConditionResponse[]>;

  /**
   * @param activeOnly Only active conditions
   * @param tenantId The tenantId String to filter on the TenantId field
   *
   * @memberof EventHistoryDB
   */
  getConditions: (activeOnly: boolean, tenantId: string) => Promise<Condition[]>;

  /**
   * @param entityId string of identifier for entity being retrieved
   * @param schemeProprietary string of scheme proprietary of the entity being retrieved
   * @param tenantId The tenantId String to filter on the TenantId field
   *
   * @memberof EventHistoryDB
   */
  getEntity: (entityId: string, schemeProprietary: string, tenantId: string) => Promise<Entity | undefined>;

  /**
   * @param accountId string of identifier for account being retrieved
   * @param schemeProprietary string of scheme proprietary of the account being retrieved
   * @param tenantId The tenantId String to filter on the TenantId field
   *
   * @memberof EventHistoryDB
   */
  getAccount: (accountId: string, schemeProprietary: string, agtMemberId: string, tenantId: string) => Promise<Account | undefined>;

  /**
   * @param source string id of the "from" node data that is connected by the edge
   * @param destination string id of the "to" node data that is connected by the edge
   * @param expireDateTime new date to use for expire timedate in edges
   * @param tenantId string tenant identifier for authorization
   *
   * @memberof EventHistoryDB
   */
  updateExpiryDateOfDebtorAccountEdges: (source: string, destination: string, expireDateTime: string, tenantId: string) => Promise<void>;

  /**
   * @param source string id of the "from" node data that is connected by the edge
   * @param destination string id of the "to" node data that is connected by the edge
   * @param expireDateTime new date to use for expire timedate in edges
   * @param tenantId string tenant identifier for authorization
   *
   * @memberof EventHistoryDB
   */
  updateExpiryDateOfCreditorAccountEdges: (source: string, destination: string, expireDateTime: string, tenantId: string) => Promise<void>;

  /**
   * @param source string id of the "from" node data that is connected by the edge
   * @param destination string id of the "to" node data that is connected by the edge
   * @param edgeDebtorByKey string id of identifier for debtor by edge
   * @param expireDateTime new date to use for expire timedate in edges
   * @param tenantId string tenant identifier for authorization
   *
   * @memberof EventHistoryDB
   */
  updateExpiryDateOfDebtorEntityEdges: (source: string, destination: string, expireDateTime: string, tenantId: string) => Promise<void>;

  /**
   * @param source string id of the "from" node data that is connected by the edge
   * @param destination string id of the "to" node data that is connected by the edge
   * @param edgeDebtorByKey string id of identifier for debtor by edge
   * @param expireDateTime new date to use for expire timedate in edges
   * @param tenantId string tenant identifier for authorization
   *
   * @memberof EventHistoryDB
   */
  updateExpiryDateOfCreditorEntityEdges: (source: string, destination: string, expireDateTime: string, tenantId: string) => Promise<void>;

  /**
   * @param conditionId string id of identifier for condition being updated
   * @param expireDateTime new date to use for expire timedate in the condition
   *
   * @memberof EventHistoryDB
   */
  updateCondition: (conditionId: string, expireDateTime: string, tenantId: string) => Promise<void>;
}
