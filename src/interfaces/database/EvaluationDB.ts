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
   * @memberof EvaluationDB
   */
  getReportByMessageId: (messageid: string) => Promise<Evaluation | undefined>;

  /**
   * Save the Evaluation Result to DB
   * @param transactionID transaction identifier
   * @param tranaction pacs002 transaction object
   * @param networkMap networkmap used in current evaluation
   * @param alert report object
   * @param dataCache dataCache object (optional)
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
