import { arangoPseudonyms, arangoTransactions } from '../src/interfaces/ArangoCollections';

describe('Should point to correct collections in transactionHistory', () => {
  test('transactionHistoryPacs008', () => {
    expect(arangoTransactions.pacs008).toBe('transactionHistoryPacs008');
  });

  test('transactionHistoryPacs002', () => {
    expect(arangoTransactions.pacs002).toBe('transactionHistoryPacs002');
  });

  test('transactionHistoryPain001', () => {
    expect(arangoTransactions.pain001).toBe('transactionHistoryPain001');
  });
});

describe('Should point to correct collections in pseudonyms', () => {
  test('pseudonyms', () => {
    expect(arangoPseudonyms.self).toBe('pseudonyms');
  });

  test('transactionRelationship', () => {
    expect(arangoPseudonyms.edges).toBe('transactionRelationship');
  });

  test('accounts', () => {
    expect(arangoPseudonyms.accounts).toBe('accounts');
  });
});
