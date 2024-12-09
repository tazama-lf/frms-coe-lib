// SPDX-License-Identifier: Apache-2.0

import { dbConfiguration, dbPseudonyms, dbEvaluateResults, dbTransactionsHistory } from '../src/interfaces/ArangoCollections';

describe('Should point to correct collections in transactionHistory', () => {
  test('transactionHistoryPacs008', () => {
    expect(dbTransactionsHistory.pacs008).toBe('transactionHistoryPacs008');
  });

  test('transactionHistoryPacs002', () => {
    expect(dbTransactionsHistory.pacs002).toBe('transactionHistoryPacs002');
  });

  test('transactionHistoryPain001', () => {
    expect(dbTransactionsHistory.pain001).toBe('transactionHistoryPain001');
  });
});

describe('Should point to correct collections in evaluateResult', () => {
  expect(dbEvaluateResults.transactions).toBe('transactions');
});

describe('Should point to correct collections in pseudonyms', () => {
  test('pseudonyms', () => {
    expect(dbPseudonyms.self).toBe('pseudonyms');
  });

  test('transactionRelationship', () => {
    expect(dbPseudonyms.transactionRelationship).toBe('transactionRelationship');
  });

  test('accounts', () => {
    expect(dbPseudonyms.accounts).toBe('accounts');
  });

  test('conditions', () => {
    expect(dbPseudonyms.conditions).toBe('conditions');
  });

  test('governed_as_debtor_by', () => {
    expect(dbPseudonyms.governed_as_debtor_by).toBe('governed_as_debtor_by');
  });

  test('governed_as_creditor_by', () => {
    expect(dbPseudonyms.governed_as_creditor_by).toBe('governed_as_creditor_by');
  });
});

describe('Should point to correct collections in configuration', () => {
  test('configuration', () => {
    expect(dbConfiguration.ruleConfiguration).toBe('ruleConfiguration');
  });
});

describe('Should point to correct collections in networkmap', () => {
  test('networkConfiguration', () => {
    expect(dbConfiguration.networkConfiguration).toBe('networkConfiguration');
  });
});
``;
