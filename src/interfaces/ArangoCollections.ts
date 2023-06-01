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
  networkMap: {
    netConfig: 'networkConfiguration',
  },
  config: {
    self: 'configuration',
  },
};
const { transactions, pseudonyms, networkMap, config } = schema;
const dbTransactions = Object.freeze(transactions);
const dbPseudonyms = Object.freeze(pseudonyms);
const dbConfiguration = Object.freeze(config);
const dbNetworkMap = Object.freeze(networkMap);
export { dbTransactions, dbPseudonyms, dbConfiguration, dbNetworkMap };
