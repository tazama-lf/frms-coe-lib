// SPDX-License-Identifier: Apache-2.0

import type { Pool } from 'pg';
import type { Pacs002, Pacs008, Pain001, Pain013 } from '..';

export interface RawHistoryDB {
  _rawHistory: Pool;

  /**
   * @param endToEndId An endToEndId String used to filter on the EndToEndId field
   * @param tenantId The tenantId String to filter on the TenantId field
   * @memberof RawHistoryDB
   */
  getTransactionPacs008: (endToEndId: string, tenantId: string) => Promise<Pacs008 | undefined>;

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
