// SPDX-License-Identifier: Apache-2.0

const schema = {
  transactions: {
    pacs008: 'transactionHistoryPacs008',
    pacs002: 'transactionHistoryPacs002',
    pain001: 'transactionHistoryPain001',
    transactions: 'transactions',
  },
  pseudonyms: {
    self: 'pseudonyms',
    accounts: 'accounts',
    account_holder: 'account_holder',
    entities: 'entities',
    transactionRelationship: 'transactionRelationship',
    conditions: 'conditions',
    governed_as_debtor_by: 'governed_as_debtor_by',
    governed_as_creditor_by: 'governed_as_creditor_by',
  },
  config: {
    ruleConfiguration: 'ruleConfiguration',
    typologyConfiguration: 'typologyConfiguration',
    transactionConfiguration: 'transactionConfiguration',
    networkConfiguration: 'networkConfiguration',
  },
};
const { transactions, pseudonyms, config } = schema;
const dbTransactions = Object.freeze(transactions);
const dbPseudonyms = Object.freeze(pseudonyms);
const dbConfiguration = Object.freeze(config);
export { dbConfiguration, dbPseudonyms, dbTransactions };
