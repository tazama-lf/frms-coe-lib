// SPDX-License-Identifier: Apache-2.0

import {
  isBaseMessageTransaction,
  isPacs002Transaction,
  isPacs008Transaction,
  isPain001Transaction,
  isPain013Transaction,
  isStructuredTransaction,
} from '../src/helpers/transactionTypeGuards';

const pacs002 = {
  TxTp: 'pacs.002.001.12',
  TenantId: 'tenant-a',
  FIToFIPmtSts: {
    GrpHdr: { MsgId: 'msg-1', CreDtTm: '2026-01-01T10:00:00.000Z' },
    TxInfAndSts: { TxSts: 'ACTC' },
  },
};

const pacs008 = {
  TxTp: 'pacs.008.001.10',
  TenantId: 'tenant-a',
  FIToFICstmrCdtTrf: {
    GrpHdr: { MsgId: 'msg-2', CreDtTm: '2026-01-01T10:00:00.000Z' },
    CdtTrfTxInf: { InstrId: 'instr-1' },
  },
};

const pain001 = {
  TxTp: 'pain.001.001.11',
  TenantId: 'tenant-a',
  CstmrCdtTrfInitn: {
    GrpHdr: { MsgId: 'msg-3', CreDtTm: '2026-01-01T10:00:00.000Z' },
    PmtInf: { PmtInfId: 'pmtinf-1' },
  },
};

const pain013 = {
  TxTp: 'pain.013.001.09',
  TenantId: 'tenant-a',
  CdtrPmtActvtnReq: {
    GrpHdr: { MsgId: 'msg-4', CreDtTm: '2026-01-01T10:00:00.000Z' },
    PmtInf: { PmtInfId: 'pmtinf-2' },
  },
};

const baseMessage = {
  TxTp: 'fable.003',
  TenantId: 'tenant-b',
  MsgId: 'msg-5',
  Payload: { amount: 100, currency: 'USD' },
};

describe('isPacs002Transaction', () => {
  test('returns true for Pacs002 shape', () => {
    expect(isPacs002Transaction(pacs002)).toBe(true);
  });

  test('returns false for other ISO types', () => {
    expect(isPacs002Transaction(pacs008)).toBe(false);
    expect(isPacs002Transaction(pain001)).toBe(false);
    expect(isPacs002Transaction(pain013)).toBe(false);
  });

  test('returns false for BaseMessage', () => {
    expect(isPacs002Transaction(baseMessage)).toBe(false);
  });
});

describe('isPacs008Transaction', () => {
  test('returns true for Pacs008 shape', () => {
    expect(isPacs008Transaction(pacs008)).toBe(true);
  });

  test('returns false for other ISO types', () => {
    expect(isPacs008Transaction(pacs002)).toBe(false);
    expect(isPacs008Transaction(pain001)).toBe(false);
    expect(isPacs008Transaction(pain013)).toBe(false);
  });

  test('returns false for BaseMessage', () => {
    expect(isPacs008Transaction(baseMessage)).toBe(false);
  });
});

describe('isPain001Transaction', () => {
  test('returns true for Pain001 shape', () => {
    expect(isPain001Transaction(pain001)).toBe(true);
  });

  test('returns false for other ISO types', () => {
    expect(isPain001Transaction(pacs002)).toBe(false);
    expect(isPain001Transaction(pacs008)).toBe(false);
    expect(isPain001Transaction(pain013)).toBe(false);
  });

  test('returns false for BaseMessage', () => {
    expect(isPain001Transaction(baseMessage)).toBe(false);
  });
});

describe('isPain013Transaction', () => {
  test('returns true for Pain013 shape', () => {
    expect(isPain013Transaction(pain013)).toBe(true);
  });

  test('returns false for other ISO types', () => {
    expect(isPain013Transaction(pacs002)).toBe(false);
    expect(isPain013Transaction(pacs008)).toBe(false);
    expect(isPain013Transaction(pain001)).toBe(false);
  });

  test('returns false for BaseMessage', () => {
    expect(isPain013Transaction(baseMessage)).toBe(false);
  });
});

describe('isStructuredTransaction', () => {
  test('returns true for all 4 structured ISO types', () => {
    expect(isStructuredTransaction(pacs002)).toBe(true);
    expect(isStructuredTransaction(pacs008)).toBe(true);
    expect(isStructuredTransaction(pain001)).toBe(true);
    expect(isStructuredTransaction(pain013)).toBe(true);
  });

  test('returns false for BaseMessage', () => {
    expect(isStructuredTransaction(baseMessage)).toBe(false);
  });

  test('returns false for invalid shape', () => {
    expect(isStructuredTransaction({ TenantId: 'x' })).toBe(false);
    expect(isStructuredTransaction(null)).toBe(false);
  });
});

describe('isBaseMessageTransaction', () => {
  test('returns true for BaseMessage shape', () => {
    expect(isBaseMessageTransaction(baseMessage)).toBe(true);
  });

  test('returns false for structured ISO types', () => {
    expect(isBaseMessageTransaction(pacs002)).toBe(false);
    expect(isBaseMessageTransaction(pacs008)).toBe(false);
    expect(isBaseMessageTransaction(pain001)).toBe(false);
    expect(isBaseMessageTransaction(pain013)).toBe(false);
  });

  test('returns false when MsgId is missing', () => {
    expect(isBaseMessageTransaction({ TxTp: 'fable.003', TenantId: 'x', Payload: {} })).toBe(false);
  });

  test('returns false when Payload is missing', () => {
    expect(isBaseMessageTransaction({ TxTp: 'fable.003', TenantId: 'x', MsgId: 'msg-1' })).toBe(false);
  });

  test('returns false for invalid shape', () => {
    expect(isBaseMessageTransaction(null)).toBe(false);
    expect(isBaseMessageTransaction({ TenantId: 'x' })).toBe(false);
  });
});
