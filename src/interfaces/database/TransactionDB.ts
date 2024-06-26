// SPDX-License-Identifier: Apache-2.0

import { type Database } from 'arangojs';
import { type NetworkMap } from '..';

export interface TransactionDB {
  _transaction: Database;

  /**
   * @param collection: Collection name against which this query will be run
   * @param filter: A String that will put next to the FILTER keyword to run against Arango
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER ${filter}
   * RETURN doc`;
   * ```
   *
   * Note, use "doc." in your query string, as we make use of "doc" as the query and return name.
   * @memberof TransactionHistoryDB
   */
  queryTransactionDB: (collection: string, filter: string, limit?: number) => Promise<unknown>;

    /**
   * @param collection: Collection name against which this query will be run
   * @param messageid: A String value that will be used to compare with Msgid from reports stored
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.transaction.FIToFIPmtSts.GrpHdr.MsgId == ${messageid}
   * RETURN doc`;
   * ```
   *
   * @memberof TransactionHistoryDB
   */
    getReportByMessageId: (collection: string, messageid: string) => Promise<unknown>;

  /* ```
   * const query = aql`
   * INSERT {
   *   "transactionID": ${JSON.stringify(transactionID)},
   *   "transaction": ${JSON.stringify(transaction)},
   *   "networkMap": ${JSON.stringify(networkMap)},
   *   "report": ${JSON.stringify(alert)}
    } INTO ${collection}`
   * ```
   *
   * @memberof TransactionDB
   */
  insertTransaction: (transactionID: string, transaction: unknown, networkMap: NetworkMap, alert: unknown) => Promise<unknown>;
}
