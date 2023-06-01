const schema = {
  transactions: {
    pacs008: 'transactionHistoryPacs008',
    pacs002: 'transactionHistoryPacs002',
    pain001: 'transactionHistoryPain001',
  },
  pseudonyms: {
    self: 'pseudonyms',
    accounts: 'accounts',
    edges: 'transactionRelationship',
  },
};
const { transactions, pseudonyms } = schema;
const arangoTransactions = Object.freeze(transactions);
const arangoPseudonyms = Object.freeze(pseudonyms);
export { arangoTransactions, arangoPseudonyms };
