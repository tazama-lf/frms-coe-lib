// SPDX-License-Identifier: Apache-2.0

import type { Pool } from 'pg';
import type { Pacs002, Pacs008, Pain001, Pain013 } from '..';

// this is in wrong place right now. This will move to right place
export interface QuarantineRecord {
  id: string;
  correlation_id: string | null;
  tenant_id: string;
  endpoint_path: string;
  config_id: string | null;
  version: string | null;
  error: string;
  raw_payload: string;
  status: string;
}

export interface trackedFields {
  CreDtTm: string;
  MsgId: string;
  EndToEndId: string;
  dbtrAcctId: string | null;
  cdtrAcctId: string | null;
  TenantId: string;
}

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

  /**
   *
   * @param record Record to be saved into the quarantine table
   *
   * @memberof RawHistoryDB
   */

  saveToQuarantine: (record: QuarantineRecord) => Promise<void>;

  /**
   * @param tableName Name of the table to save transaction history into (dynamic)
   * @param tran Transaction record to be saved
   *
   * @memberof RawHistoryDB
   */
  saveDynamicTransactionHistory: (tableName: string, tran: Record<string, unknown>, trackedFields?: trackedFields) => Promise<void>;
}
