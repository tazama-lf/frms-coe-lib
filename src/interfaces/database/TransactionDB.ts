import { Database } from 'arangojs';
import { NetworkMap } from '..';

export interface TransactionDB {
  _transactions: Database;

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
