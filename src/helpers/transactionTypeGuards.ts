// SPDX-License-Identifier: Apache-2.0

import type { BaseMessage, Pacs002 } from '../interfaces';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Type guard to detect Pacs002 transactions.
 */
export const isPacs002Transaction = (transaction: unknown): transaction is Pacs002 => {
  if (!isRecord(transaction)) {
    return false;
  }

  if (!isString(transaction.TxTp) || !isString(transaction.TenantId)) {
    return false;
  }

  const pacsRoot = transaction.FIToFIPmtSts;
  if (!isRecord(pacsRoot)) {
    return false;
  }

  return isRecord(pacsRoot.GrpHdr) && isRecord(pacsRoot.TxInfAndSts);
};

/**
 * Type guard to detect BaseMessage transactions.
 */
export const isBaseMessageTransaction = (transaction: unknown): transaction is BaseMessage => {
  if (!isRecord(transaction)) {
    return false;
  }

  if (!isString(transaction.TxTp) || !isString(transaction.TenantId) || !isString(transaction.MsgId)) {
    return false;
  }

  if (!isRecord(transaction.Payload)) {
    return false;
  }

  return !('FIToFIPmtSts' in transaction);
};
