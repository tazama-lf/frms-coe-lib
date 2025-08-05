// SPDX-License-Identifier: Apache-2.0

import type { Database } from 'arangojs';
import type { DataCache, NetworkMap } from '..';

export interface TransactionDB {
  _transaction: Database;

  /**
   * @param collection: Collection name against which this query will be run
   * @param tenantId: Tenant ID to filter the documents
   * @param filter: A String that will put next to the FILTER keyword to run against Arango
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER ${filter}
   * FILTER doc.TenantId == ${tenantId}
   * RETURN doc`;
   * ```
   *
   * Note, use "doc." in your query string, as we make use of "doc" as the query and return name.
   * @memberof TransactionHistoryDB
   */
  queryTransactionDB: (collection: string, tenantId: string, filter: string, limit?: number) => Promise<unknown>;

  /**
   * @param collection: Collection name against which this query will be run
   * @param tenantId: Tenant ID to filter the documents
   * @param messageid: A String value that will be used to compare with Msgid from reports stored
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.transaction.FIToFIPmtSts.GrpHdr.MsgId == ${messageid}
   * FILTER doc.transaction.TenantId == ${aqlTenantId}
   * RETURN doc`;
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  getReportByMessageId: (messageid: string, tenantId: string) => Promise<unknown>;

  /* ```
   * const query = aql`
   * INSERT {
   *   "transactionID": ${JSON.stringify(transactionID)},
   *   "transaction": ${JSON.stringify(transaction)},
   *   "networkMap": ${JSON.stringify(networkMap)},
   *   "report": ${JSON.stringify(alert)},
   *   "dataCache": ${JSON.stringify(dataCache)}
    } INTO ${collection}`
   * ```
   *
   * @memberof TransactionDB
   */
  insertTransaction: (
    transactionID: string,
    transaction: unknown,
    networkMap: NetworkMap,
    alert: unknown,
    dataCache?: DataCache,
  ) => Promise<unknown>;
}
