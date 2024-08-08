// SPDX-License-Identifier: Apache-2.0

import { type Database } from 'arangojs';
import { type ConditionEdge, type EntityCondition, type TransactionRelationship } from '..';

export interface PseudonymsDB {
  _pseudonymsDb: Database;

  /**
   * @param collection Collection name against which this query will be run
   * @param filter String that will put next to the FILTER keyword to run against Arango
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER ${filter}
   * RETURN doc`;
   * ```
   *
   * Note, use "doc." in your query string, as we make use of "doc" as the query and return name.
   * @memberof PseudonymsDB
   */
  queryPseudonymDB: (collection: string, filter: string, limit?: number) => Promise<unknown>;

  /**
   * @param hash Hash String used to identify the pseudonym we are looking up
   *
   * ```
   * const query: AqlQuery = aql`
   * FOR doc IN ${collection}
   * FILTER doc.pseudonym == ${hash}
   * RETURN doc`
   * ```
   *
   * @memberof PseudonymsDB
   */
  getPseudonyms: (hash: string) => Promise<unknown>;

  /**
   * @deprecated use saveAccount instead
   * @param hash Hash string used to identify the pseudonym we are storing
   *
   * This is a insert query to the accounts collection with overwrite mode set to `ignore`
   * @memberof PseudonymsDB
   */
  addAccount: (hash: string) => Promise<unknown>;

  /**
   * @param {TransactionRelationship} tR TransactionRelationship Object
   *
   * This is a insert query to the transactionRelationship collection with overwrite mode set to `ignore`
   * @memberof PseudonymsDB
   */
  saveTransactionRelationship: (tR: TransactionRelationship) => Promise<unknown>;

  /**
   * @param endToEndIds An Array of endToEndIds Strings to find their related pacs.008 edge set
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId IN ${endToEndIds}
   * FILTER doc.TxTp == 'pacs.008.001.10'
   * RETURN doc`
   * ```
   * @memberof PseudonymsDB
   */
  getPacs008Edge: (endToEndIds: string[]) => Promise<unknown>;

  /**
   * @param accountId The accountId String to filter on the _to field
   * @param threshold The time String Threshold to return transactions newer that date threshold
   * @param amount The amount Number to filter on the Amt field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._to == accounts/${accountId}
   * FILTER doc.TxTp == 'pacs.008.001.10'
   * *FILTER doc.CreDtTm < ${threshold}
   * *FILTER doc.Amt == ${amount}
   * RETURN doc`
   * ```
   * \* Indicates filter is only applied when parameter is passed in
   * @memberof PseudonymsDB
   */
  getPacs008Edges: (accountId: string, threshold?: string, amount?: number) => Promise<unknown>;

  /**
   * @param endToEndIds An Array of endToEndIds Strings to find their related pacs.002 edge set
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId IN ${endToEndIds}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * RETURN doc`
   * ```
   * @memberof PseudonymsDB
   */
  getPacs002Edge: (endToEndIds: string[]) => Promise<unknown>;

  /**
   * @param debtorId A debtorId String to filter on the _from field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._from == accounts/${debtorId}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * FILTER doc.TxSts == 'ACCC'
   * RETURN doc`
   * ```
   * Returns only successful transactions as denoted by 'ACCC'
   * @memberof PseudonymsDB
   */
  getDebtorPacs002Edges: (debtorId: string) => Promise<unknown>;

  /**
   * @param accountId A accountId String to filter on the _to field
   * @param limit A limit Number to optionally limit results
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._to == accounts/${accountId}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * FILTER doc.TxSts == 'ACCC'
   * *LIMIT ${limit}
   * RETURN doc`
   * ```
   *
   * \* Indicates filter is only applied when parameter is passed in
   * @memberof PseudonymsDB
   */
  getIncomingPacs002Edges: (accountId: string, limit?: number) => Promise<unknown>;

  /**
   * @param accountId A accountId String to filter on the _from field
   * @param limit A limit Number to optionally limit results
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._from == accounts/${accountId}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * FILTER doc.TxSts == 'ACCC'
   * *LIMIT ${limit}
   * RETURN doc`
   * ```
   *
   * \* Indicates filter is only applied when parameter is passed in
   * @memberof PseudonymsDB
   */
  getOutgoingPacs002Edges: (accountId: string, limit?: number) => Promise<unknown>;

  /**
   * @param creditorId A creditorId Array of String to filter on the _to field
   * @param debtorId A debtorId String to filter on the _from field
   * @param endToEndId A endToEndId Array of String to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._to IN ${creditorId}
   * FILTER doc._from == accounts/${debtorId}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * FILTER doc.EndToEndId IN ${endToEndId}
   * FILTER doc.TxSts == 'ACCC'
   * SORT doc.CreDtTm DESC
   * LIMIT 2
   * RETURN doc`
   * ```
   *
   * @memberof PseudonymsDB
   */
  getSuccessfulPacs002Edges: (creditorId: string[], debtorId: string, endToEndId: string[]) => Promise<unknown>;

  /**
   * @param debtorId A debtorId String to filter on the _from field
   * @param @deprecated endToEndId no longer filters
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._from == accounts/${debtorId}
   * FILTER doc.TxTp == 'pacs.008.001.10'
   * SORT doc.CreDtTm DESC
   * LIMIT 2
   * RETURN doc`
   * ```
   *
   * @memberof PseudonymsDB
   */
  getDebtorPacs008Edges: (debtorId: string, endToEndId: string) => Promise<unknown>;

  /**
   * @param creditorId A creditorId String to filter on the _to field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._to == accounts/${creditorId}
   * FILTER doc.TxTp == 'pacs.008.001.10'
   * SORT doc.CreDtTm DESC
   * LIMIT 2
   * RETURN doc`
   * ```
   * @memberof PseudonymsDB
   */
  getCreditorPacs008Edges: (creditorId: string) => Promise<unknown>;

  /**
   * @param debtorId A debtorId String to filter on the _from field
   * @param limit A limit Number to optionally limit results
   * @param to A to Array of String to filter on the _to field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._from == accounts/${accountId}
   * *FILTER doc._to IN ${to}
   * SORT doc.CreDtTm DESC
   * LIMIT ${aqlLimit} (default 3)
   * RETURN doc`
   * ```
   *
   * \* Indicates filter is only applied when parameter is passed in
   * @memberof PseudonymsDB
   */
  getPreviousPacs008Edges: (debtorId: string, limit?: number, to?: string[]) => Promise<unknown>;

  /**
   * @param creditorId A creditorId String to filter on the _from field
   * @param threshold A threshold Number (in seconds) used to determine how far back to filter
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._from == accounts/${creditorId}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * FILTER doc.TxSts == 'ACCC'
   * FILTER doc.CreDtTm >= ${now - threshold}
   * RETURN doc`
   * ```
   * @memberof PseudonymsDB
   */
  getCreditorPacs002Edges: (creditorId: string, threshold: number) => Promise<unknown>;

  /**
   * @param key string account identifier we are storing
   *
   * @memberof PseudonymsDB
   */
  saveAccount: (key: string) => Promise<unknown>;

  /**
   * @param entityId string entity identifier we are storing
   * @param CreDtTm string timestamp
   *
   * @memberof PseudonymsDB
   */
  saveEntity: (entityId: string, CreDtTm: string) => Promise<unknown>;

  /**
   * @param entityId string entity identifier we are storing
   * @param accountId string account identifier we are storing
   * @param CreDtTm string timestamp
   *
   * @memberof PseudonymsDB
   */
  saveAccountHolder: (entityId: string, accountId: string, CreDtTm: string) => Promise<unknown>;

  /**
   * @param condition condition object we are storing of EntityCondition type
   *
   * @memberof PseudonymsDB
   */
  saveCondition: (condition: EntityCondition) => Promise<unknown>;

  /**
   * @param conditionId string condition identifier we are storing the edge connect
   * @param accountEntityId string account or entity identifier we are storing the edge connect
   * @param conditionEdge condition edge for account or entity to condition
   *
   * @memberof PseudonymsDB
   */
  saveGovernedAsCreditorByEdge: (conditionId: string, accountEntityId: string, conditionEdge: ConditionEdge) => Promise<unknown>;

  /**
   * @param conditionId string condition identifier we are storing the edge connect
   * @param accountEntityId string account or entity identifier we are storing the edge connect
   * @param conditionEdge condition edge for account or entity to condition
   *
   * @memberof PseudonymsDB
   */
  saveGovernedAsDebtorByEdge: (conditionId: string, accountEntityId: string, conditionEdge: ConditionEdge) => Promise<unknown>;

  /**
   * @param entityId string of identifier for entity being retrieved
   * @param SchemeProprietary string of scheme proprietary of the entity being retrieved
   *
   * @memberof PseudonymsDB
   */
  getConditionsByEntity: (entityId: string, SchemeProprietary: string) => Promise<unknown>;

  /**
   * @param entityId string of identifier for entity being retrieved
   * @param SchemeProprietary string of scheme proprietary of the entity being retrieved
   *
   * @memberof PseudonymsDB
   */
  getEntity: (entityId: string, SchemeProprietary: string) => Promise<unknown>;

  /**
   * @param accountId string of identifier for account being retrieved
   * @param SchemeProprietary string of scheme proprietary of the account being retrieved
   *
   * @memberof PseudonymsDB
   */
  getAccount: (accountId: string, SchemeProprietary: string, agtMemberId: string) => Promise<unknown>;

  /**
   * @param accountId string of identifier for account being retrieved
   * @param SchemeProprietary string of scheme proprietary of the account being retrieved
   * @param MemberId string of financial institution member id of the account being retrieved
   *
   * @memberof PseudonymsDB
   */
  getConditionsByAccount: (accountId: string, SchemeProprietary: string, MemberId: string) => Promise<unknown>;
}
