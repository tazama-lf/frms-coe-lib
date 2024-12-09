// SPDX-License-Identifier: Apache-2.0

const schema = {
  evaluateResults: {
    transactions: 'transactions',
  },
  transactionHistory: {
    pacs008: 'transactionHistoryPacs008',
    pacs002: 'transactionHistoryPacs002',
    pain001: 'transactionHistoryPain001',
    pain013: 'transactionHistoryPain013',
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
    governed_as_debtor_account_by: 'governed_as_debtor_account_by',
    governed_as_creditor_account_by: 'governed_as_creditor_account_by',
  },
  configuration: {
    ruleConfiguration: 'ruleConfiguration',
    typologyConfiguration: 'typologyConfiguration',
    transactionConfiguration: 'transactionConfiguration',
    networkConfiguration: 'networkConfiguration',
  },
};
const { transactionHistory, pseudonyms, configuration, evaluateResults } = schema;
const dbTransactionsHistory = Object.freeze(transactionHistory);
const dbPseudonyms = Object.freeze(pseudonyms);
const dbConfiguration = Object.freeze(configuration);
const dbEvaluateResults = Object.freeze(evaluateResults);
export { dbConfiguration, dbPseudonyms, dbTransactionsHistory, dbEvaluateResults };
