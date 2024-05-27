// SPDX-License-Identifier: Apache-2.0

import { dbConfiguration, dbNetworkMap, dbPseudonyms, dbTransactions } from '../src/interfaces/ArangoCollections';

describe('Should point to correct collections in transactionHistory', () => {
  test('transactionHistoryPacs008', () => {
    expect(dbTransactions.pacs008).toBe('transactionHistoryPacs008');
  });

  test('transactionHistoryPacs002', () => {
    expect(dbTransactions.pacs002).toBe('transactionHistoryPacs002');
  });

  test('transactionHistoryPain001', () => {
    expect(dbTransactions.pain001).toBe('transactionHistoryPain001');
  });
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
});

describe('Should point to correct collections in configuration', () => {
  test('configuration', () => {
    expect(dbConfiguration.self).toBe('configuration');
  });
});

describe('Should point to correct collections in networkmap', () => {
  test('networkConfiguration', () => {
    expect(dbNetworkMap.netConfig).toBe('networkConfiguration');
  });
});
