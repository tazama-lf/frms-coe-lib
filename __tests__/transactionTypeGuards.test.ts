// SPDX-License-Identifier: Apache-2.0

import { isBaseMessageTransaction, isPacs002Transaction } from '../src/helpers/transactionTypeGuards';

describe('transactionTypeGuards', () => {
  test('isPacs002Transaction returns true for Pacs002 shape', () => {
    const transaction = {
      TxTp: 'pacs.002.001.12',
      TenantId: 'tenant-a',
      FIToFIPmtSts: {
        GrpHdr: {
          MsgId: 'msg-1',
          CreDtTm: '2026-01-01T10:00:00.000Z',
        },
        TxInfAndSts: {
          OrgnlInstrId: 'instr-1',
          OrgnlEndToEndId: 'e2e-1',
          TxSts: 'ACTC',
          ChrgsInf: [],
          AccptncDtTm: '2026-01-01T10:00:00.000Z',
          InstgAgt: { FinInstnId: { ClrSysMmbId: { MmbId: 'bank-a' } } },
          InstdAgt: { FinInstnId: { ClrSysMmbId: { MmbId: 'bank-b' } } },
        },
      },
    };

    expect(isPacs002Transaction(transaction)).toBe(true);
    expect(isBaseMessageTransaction(transaction)).toBe(false);
  });

  test('isBaseMessageTransaction returns true for BaseMessage shape', () => {
    const transaction = {
      TxTp: 'fable.003',
      TenantId: 'tenant-b',
      MsgId: 'msg-2',
      Payload: {
        storyamount: {
          amount: 100,
          currency: 'USD',
        },
      },
    };

    expect(isBaseMessageTransaction(transaction)).toBe(true);
    expect(isPacs002Transaction(transaction)).toBe(false);
  });

  test('both guards return false for invalid shape', () => {
    const transaction = {
      TenantId: 'tenant-c',
      Payload: {
        value: true,
      },
    };

    expect(isPacs002Transaction(transaction)).toBe(false);
    expect(isBaseMessageTransaction(transaction)).toBe(false);
  });

  test('isBaseMessageTransaction returns false when MsgId is missing', () => {
    const transaction = {
      TxTp: 'fable.003',
      TenantId: 'tenant-d',
      Payload: {
        amount: 100,
      },
    };

    expect(isBaseMessageTransaction(transaction)).toBe(false);
  });

  test('isBaseMessageTransaction returns false when Payload is missing', () => {
    const transaction = {
      TxTp: 'fable.003',
      TenantId: 'tenant-e',
      MsgId: 'msg-5',
    };

    expect(isBaseMessageTransaction(transaction)).toBe(false);
  });
});
