// SPDX-License-Identifier: Apache-2.0

import type { Pool } from 'pg';
import type { DataCache, NetworkMap, Pacs002 } from '..';
import type { Evaluation } from '../processor-files/TADPReport';
import type { Alert } from '../processor-files/Alert';

export interface EvaluationDB {
  _evaluation: Pool;

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
   * @memberof EvaluationDB
   */
  getReportByMessageId: (messageid: string) => Promise<Evaluation | undefined>;

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
   * @memberof EvaluationDB
   */
  saveEvaluationResult: (
    transactionID: string,
    transaction: Pacs002,
    networkMap: NetworkMap,
    alert: Alert,
    dataCache?: DataCache,
  ) => Promise<void>;
}
