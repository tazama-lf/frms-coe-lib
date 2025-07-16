// SPDX-License-Identifier: Apache-2.0

import type { Database } from 'arangojs';
import type { NetworkMap, AccountType, Pain001, Pain013, Pacs008, Pacs002 } from '..';

export interface TransactionHistoryDB {
  _transactionHistory: Database;

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
   * @param endToEndId An endToEndId String used to filter on the EndToEndId field
   * @param cacheKey A cacheKey String used to check the cache instead of executing the arango query
   *
   * Will only execute query if no cache key or cache didn't contain the key
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId == ${endToEndId}
   * RETURN doc`
   * ```
   * @memberof TransactionHistoryDB
   */
  getTransactionPacs008: (endToEndId: string, cacheKey?: string) => Promise<unknown>;

  /**
   * @param endToEndId An endToEndId String used to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId == ${endToEndId}
   * RETURN doc`
   * ```
   * @memberof TransactionHistoryDB
   */
  getTransactionPain001: (endToEndId: string, cacheKey?: string) => Promise<unknown>;

  /**
   * @param debtorId A debtorId String used to filter on the DebtorAcctId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.DebtorAcctId == ${debtorId}
   * SORT doc.CreDtTm
   * LIMIT 1
   * RETURN doc`
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  getDebtorPain001Msgs: (debtorId: string) => Promise<unknown>;

  /**
   * @param creditorId A creditorId String used to filter on the CreditorAcctId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.CreditorAcctId == ${creditorId}
   * SORT doc.CreDtTm
   * LIMIT 1
   * RETURN doc`
   * ```
   * @memberof TransactionHistoryDB
   */
  getCreditorPain001Msgs: (creditorId: string) => Promise<unknown>;

  /**
   * @param endToEndId An endToEndId String used to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId == ${endToEndId}
   * FILTER doc.TxSts == 'ACCC'
   * SORT doc.CreDtTm DESC
   * LIMIT 1
   * RETURN doc`
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  getSuccessfulPacs002Msgs: (endToEndId: string) => Promise<unknown>;

  /**
   * @param endToEndIds An endToEndId Array of String used to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId IN ${endToEndIds}
   * FILTER doc.TxSts == 'ACCC'
   * RETURN doc.EndToEndId`
   * ```
   * Note only returns EndToEndIds of those successful ('ACCC')
   * @memberof TransactionHistoryDB
   */
  getSuccessfulPacs002EndToEndIds: (endToEndIds: string[]) => Promise<unknown>;

  /**
   * @param endToEndId An endToEndId String used to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId == ${endToEndId}
   * RETURN doc
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  getDebtorPacs002Msgs: (endToEndId: string) => Promise<unknown>;

  /**
   * @param endToEndIds An endToEndId Array of String used to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId IN ${endToEndIds}
   * SORT doc.EndToEndId DESC
   * RETURN doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.RmtInf.Ustrd
   * ```
   *
   * Note only returns the `CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.RmtInf.Ustrd` field
   * @memberof TransactionHistoryDB
   */
  getEquivalentPain001Msg: (endToEndIds: string[]) => Promise<unknown>;

  /**
   * @param accountId An accountId String to filter on the provided accountId field
   * @param accountType An accountType Enum to distinguish which type of account to filter to apply: [0 , 1]
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * *FILTER doc.CreditorAcctId == ${accountId} (accountType == 1)
   * *FILTER doc.DebtorAcctId == ${accountId} (accountType == 0)
   * RETURN {
   *  e2eId: doc.EndToEndId,
   *  timestamp: DATE_TIMESTAMP(doc.CreDtTm)
   * }
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  getAccountEndToEndIds: (accountId: string, accountType: AccountType) => Promise<unknown>;

  /**
   * @param accountId An accountId String to filter on the provided accountId field
   * @param accountType An accountType Enum to distinguish which type of account to filter to apply: [0 , 1]
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * *FILTER doc.CreditorAcctId == ${accountId} (accountType == 1)
   * *FILTER doc.DebtorAcctId == ${accountId} (accountType == 0)
   * RETURN doc
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  getAccountHistoryPacs008Msgs: (accountId: string, accountType: AccountType) => Promise<unknown>;

  /**
   * @param transactionID An transactionID String to identify the transaction
   * @param transaction An transaction object to store
   * @param networkMap An networkMap object to store
   * @param alert An alert report object to store
   *
   * ```
   * const query = aql`
   * INSERT {
   *   "transactionID": ${JSON.stringify(transactionID)},
   *   "transaction": ${JSON.stringify(transaction)},
   *   "networkMap": ${JSON.stringify(networkMap)},
   *   "report": ${JSON.stringify(alert)}
    } INTO ${collection}`
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  insertTransaction: (transactionID: string, transaction: unknown, networkMap: NetworkMap, alert: unknown) => Promise<unknown>;

  /**
   * @param transaction One of Pain001 | Pain013 | Pacs008 | Pacs002 to store
   * @param transactionhistorycollection The collection where to store
   *
   * @memberof TransactionHistoryDB
   */
  saveTransactionHistory: (transaction: Pain001 | Pain013 | Pacs008 | Pacs002, transactionhistorycollection: string) => Promise<unknown>;

  /**
   * @param transaction Transaction of Type Pain001 to store
   *
   * @memberof TransactionHistoryDB
   */
  saveTransactionHistoryPain001: (transaction: Pain001) => Promise<unknown>;

  /**
   * @param transaction Transaction of Type Pain013 to store
   *
   * @memberof TransactionHistoryDB
   */
  saveTransactionHistoryPain013: (transaction: Pain013) => Promise<unknown>;

  /**
   * @param transaction Transaction of Type Pacs008 to store
   *
   * @memberof TransactionHistoryDB
   */
  saveTransactionHistoryPacs008: (transaction: Pacs008) => Promise<unknown>;

  /**
   * @param transaction Transaction of Type Pacs002 to store
   *
   * @memberof TransactionHistoryDB
   */
  saveTransactionHistoryPacs002: (transaction: Pacs002) => Promise<unknown>;
}
