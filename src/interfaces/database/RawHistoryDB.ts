// SPDX-License-Identifier: Apache-2.0

import type { Pool } from 'pg';
import type { Pacs002, Pacs008, Pain001, Pain013 } from '..';

export interface RawHistoryDB {
  _rawHistory: Pool;

  /**
   * @param endToEndId An endToEndId String used to filter on the EndToEndId field
   * @param cacheKey A cacheKey String used to check the cache instead of executing the postgres query
   *
   * Will only execute query if no cache key or cache didn't contain the key
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId == ${endToEndId}
   * RETURN doc`
   * ```
   * @memberof RawHistoryDB
   */
  getTransactionPacs008: (endToEndId: string, cacheKey?: string) => Promise<Pacs008 | undefined>;

  /**
   * @param transaction Transaction of Type Pain001 to store
   *
   * @memberof RawHistoryDB
   */
  saveTransactionHistoryPain001: (transaction: Pain001) => Promise<void>;

  /**
   * @param transaction Transaction of Type Pain013 to store
   *
   * @memberof RawHistoryDB
   */
  saveTransactionHistoryPain013: (transaction: Pain013) => Promise<void>;

  /**
   * @param transaction Transaction of Type Pacs008 to store
   *
   * @memberof RawHistoryDB
   */
  saveTransactionHistoryPacs008: (transaction: Pacs008) => Promise<void>;

  /**
   * @param transaction Transaction of Type Pacs002 to store
   *
   * @memberof RawHistoryDB
   */
  saveTransactionHistoryPacs002: (transaction: Pacs002) => Promise<void>;
}
