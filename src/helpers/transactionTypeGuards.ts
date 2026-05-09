// SPDX-License-Identifier: Apache-2.0

import type { BaseMessage, Pacs002, Pacs008, Pain001, Pain013 } from '../interfaces';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Type guard to detect Pacs002 (pacs.002.001.12) transactions.
 * Checks for FIToFIPmtSts with GrpHdr and TxInfAndSts.
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
 * Type guard to detect Pacs008 (pacs.008.001.10) transactions.
 * Checks for FIToFICstmrCdtTrf with GrpHdr and CdtTrfTxInf.
 */
export const isPacs008Transaction = (transaction: unknown): transaction is Pacs008 => {
  if (!isRecord(transaction)) {
    return false;
  }

  if (!isString(transaction.TxTp) || !isString(transaction.TenantId)) {
    return false;
  }

  const pacsRoot = transaction.FIToFICstmrCdtTrf;
  if (!isRecord(pacsRoot)) {
    return false;
  }

  return isRecord(pacsRoot.GrpHdr) && isRecord(pacsRoot.CdtTrfTxInf);
};

/**
 * Type guard to detect Pain001 (pain.001.001.11) transactions.
 * Checks for CstmrCdtTrfInitn with GrpHdr and PmtInf.
 */
export const isPain001Transaction = (transaction: unknown): transaction is Pain001 => {
  if (!isRecord(transaction)) {
    return false;
  }

  if (!isString(transaction.TxTp) || !isString(transaction.TenantId)) {
    return false;
  }

  const painRoot = transaction.CstmrCdtTrfInitn;
  if (!isRecord(painRoot)) {
    return false;
  }

  return isRecord(painRoot.GrpHdr) && isRecord(painRoot.PmtInf);
};

/**
 * Type guard to detect Pain013 (pain.013.001.09) transactions.
 * Checks for CdtrPmtActvtnReq with GrpHdr and PmtInf.
 */
export const isPain013Transaction = (transaction: unknown): transaction is Pain013 => {
  if (!isRecord(transaction)) {
    return false;
  }

  if (!isString(transaction.TxTp) || !isString(transaction.TenantId)) {
    return false;
  }

  const painRoot = transaction.CdtrPmtActvtnReq;
  if (!isRecord(painRoot)) {
    return false;
  }

  return isRecord(painRoot.GrpHdr) && isRecord(painRoot.PmtInf);
};

/**
 * Gate check: returns true if the transaction is any of the 4 supported structured types
 * (Pacs002, Pacs008, Pain001, Pain013). Use this before type-specific narrowing.
 */
export const isStructuredTransaction = (transaction: unknown): transaction is Pacs002 | Pacs008 | Pain001 | Pain013 =>
  isPacs002Transaction(transaction) ||
  isPacs008Transaction(transaction) ||
  isPain001Transaction(transaction) ||
  isPain013Transaction(transaction);

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
