/* eslint-disable @typescript-eslint/no-explicit-any */

import { aql, Database } from 'arangojs';
import { join, type AqlQuery, type GeneratedAqlQuery } from 'arangojs/aql';
import * as fs from 'fs';
import NodeCache from 'node-cache';
import { RedisService, type RedisConfig } from '..';
import { AccountType, type TransactionRelationship } from '../interfaces';
import { dbConfiguration, dbNetworkMap, dbPseudonyms, dbTransactions } from '../interfaces/ArangoCollections';

let readyChecks: Record<string, string | unknown> = {};

interface DBConfig {
  url: string;
  user: string;
  password: string;
  databaseName: string;
  certPath: string;
  localCacheEnabled?: boolean;
  localCacheTTL?: number;
}

interface ManagerConfig {
  pseudonyms?: DBConfig;
  transactionHistory?: DBConfig;
  configuration?: DBConfig;
  networkMap?: DBConfig;
  redisConfig?: RedisConfig;
}

interface PseudonymsDB {
  _pseudonymsDb: Database;

  /**
   * @param collection Collection name against which this query will be run
   * @param filter String that will put next to the FILTER keyword to run against Arango
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER ${filter}
   * RETURN doc`;
   * ```
   *
   * Note, use "doc." in your query string, as we make use of "doc" as the query and return name.
   * @memberof PseudonymsDB
   */
  queryPseudonymDB: (collection: string, filter: string, limit?: number) => Promise<any>;

  /**
   * @param hash Hash String used to identify the pseudonym we are looking up
   *
   * ```
   * const query: AqlQuery = aql`
   * FOR doc IN ${collection}
   * FILTER doc.pseudonym == ${hash}
   * RETURN doc`
   * ```
   *
   * @memberof PseudonymsDB
   */
  getPseudonyms: (hash: string) => Promise<any>;

  /**
   * @param hash Hash string used to identify the pseudonym we are storing
   *
   * This is a insert query to the accounts collection with overwrite mode set to `ignore`
   * @memberof PseudonymsDB
   */
  addAccount: (hash: string) => Promise<any>;

  /**
   * @param {TransactionRelationship} tR TransactionRelationship Object
   *
   * This is a insert query to the transactionRelationship collection with overwrite mode set to `ignore`
   * @memberof PseudonymsDB
   */
  saveTransactionRelationship: (tR: TransactionRelationship) => Promise<any>;

  /**
   * @param endToEndIds An Array of endToEndIds Strings to find their related pacs.008 edge set
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId IN ${endToEndIds}
   * FILTER doc.TxTp == 'pacs.008.001.10'
   * RETURN doc`
   * ```
   * @memberof PseudonymsDB
   */
  getPacs008Edge: (endToEndIds: string[]) => Promise<any>;

  /**
   * @param accountId The accountId String to filter on the _to field
   * @param threshold The time String Threshold to return transactions newer that date threshold
   * @param amount The amount Number to filter on the Amt field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._to == accounts/${accountId}
   * FILTER doc.TxTp == 'pacs.008.001.10'
   * *FILTER doc.CreDtTm < ${threshold}
   * *FILTER doc.Amt == ${amount}
   * RETURN doc`
   * ```
   * \* Indicates filter is only applied when parameter is passed in
   * @memberof PseudonymsDB
   */
  getPacs008Edges: (accountId: string, threshold?: string, amount?: number) => Promise<any>;

  /**
   * @param endToEndIds An Array of endToEndIds Strings to find their related pacs.002 edge set
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId IN ${endToEndIds}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * RETURN doc`
   * ```
   * @memberof PseudonymsDB
   */
  getPacs002Edge: (endToEndIds: string[]) => Promise<any>;

  /**
   * @param debtorId A debtorId String to filter on the _from field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._from == accounts/${debtorId}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * FILTER doc.TxSts == 'ACCC'
   * RETURN doc`
   * ```
   * Returns only successful transactions as denoted by 'ACCC'
   * @memberof PseudonymsDB
   */
  getDebtorPacs002Edges: (debtorId: string) => Promise<any>;

  /**
   * @param accountId A accountId String to filter on the _to field
   * @param limit A limit Number to optionally limit results
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._to == accounts/${accountId}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * FILTER doc.TxSts == 'ACCC'
   * *LIMIT ${limit}
   * RETURN doc`
   * ```
   *
   * \* Indicates filter is only applied when parameter is passed in
   * @memberof PseudonymsDB
   */
  getIncomingPacs002Edges: (accountId: string, limit?: number) => Promise<any>;

  /**
   * @param accountId A accountId String to filter on the _from field
   * @param limit A limit Number to optionally limit results
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._from == accounts/${accountId}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * FILTER doc.TxSts == 'ACCC'
   * *LIMIT ${limit}
   * RETURN doc`
   * ```
   *
   * \* Indicates filter is only applied when parameter is passed in
   * @memberof PseudonymsDB
   */
  getOutgoingPacs002Edges: (accountId: string, limit?: number) => Promise<any>;

  /**
   * @param creditorId A creditorId Array of String to filter on the _to field
   * @param debtorId A debtorId String to filter on the _from field
   * @param endToEndId A endToEndId Array of String to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._to IN ${creditorId}
   * FILTER doc._from == accounts/${debtorId}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * FILTER doc.EndToEndId IN ${endToEndId}
   * FILTER doc.TxSts == 'ACCC'
   * SORT doc.CreDtTm DESC
   * LIMIT 2
   * RETURN doc`
   * ```
   *
   * @memberof PseudonymsDB
   */
  getSuccessfulPacs002Edges: (creditorId: string[], debtorId: string, endToEndId: string[]) => Promise<any>;

  /**
   * @param debtorId A debtorId String to filter on the _from field
   * @param @deprecated endToEndId no longer filters
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._from == accounts/${debtorId}
   * FILTER doc.TxTp == 'pacs.008.001.10'
   * SORT doc.CreDtTm DESC
   * LIMIT 2
   * RETURN doc`
   * ```
   *
   * @memberof PseudonymsDB
   */
  getDebtorPacs008Edges: (debtorId: string, endToEndId: string) => Promise<any>;

  /**
   * @param creditorId A creditorId String to filter on the _to field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._to == accounts/${creditorId}
   * FILTER doc.TxTp == 'pacs.008.001.10'
   * SORT doc.CreDtTm DESC
   * LIMIT 2
   * RETURN doc`
   * ```
   * @memberof PseudonymsDB
   */
  getCreditorPacs008Edges: (creditorId: string) => Promise<any>;

  /**
   * @param debtorId A debtorId String to filter on the _from field
   * @param limit A limit Number to optionally limit results
   * @param to A to Array of String to filter on the _to field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._from == accounts/${accountId}
   * *FILTER doc._to IN ${to}
   * SORT doc.CreDtTm DESC
   * LIMIT ${aqlLimit} (default 3)
   * RETURN doc`
   * ```
   *
   * \* Indicates filter is only applied when parameter is passed in
   * @memberof PseudonymsDB
   */
  getPreviousPacs008Edges: (debtorId: string, limit?: number, to?: string[]) => Promise<any>;

  /**
   * @param creditorId A creditorId String to filter on the _from field
   * @param threshold A threshold Number (in seconds) used to determine how far back to filter
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc._from == accounts/${creditorId}
   * FILTER doc.TxTp == 'pacs.002.001.12'
   * FILTER doc.TxSts == 'ACCC'
   * FILTER doc.CreDtTm >= ${now - threshold}
   * RETURN doc`
   * ```
   * @memberof PseudonymsDB
   */
  getCreditorPacs002Edges: (creditorId: string, threshold: number) => Promise<any>;
}

interface TransactionHistoryDB {
  _transactionHistory: Database;

  /**
   * @param collection: Collection name against which this query will be run
   * @param filter: A String that will put next to the FILTER keyword to run against Arango
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER ${filter}
   * RETURN doc`;
   * ```
   *
   * Note, use "doc." in your query string, as we make use of "doc" as the query and return name.
   * @memberof TransactionHistoryDB
   */
  queryTransactionDB: (collection: string, filter: string, limit?: number) => Promise<any>;

  /**
   * @param endToEndId An endToEndId String used to filter on the EndToEndId field
   * @param cacheKey A cacheKey String used to check the cache instead of executing the arango query
   *
   * Will only execute query if no cache key or cache didn't contain the key
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId == ${endToEndId}
   * RETURN doc`
   * ```
   * @memberof TransactionHistoryDB
   */
  getTransactionPacs008: (endToEndId: string, cacheKey?: string) => Promise<any>;

  /**
   * @param endToEndId An endToEndId String used to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId == ${endToEndId}
   * RETURN doc`
   * ```
   * @memberof TransactionHistoryDB
   */
  getTransactionPain001: (endToEndId: string, cacheKey?: string) => Promise<any>;

  /**
   * @param debtorId A debtorId String used to filter on the DebtorAcctId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.DebtorAcctId == ${debtorId}
   * SORT doc.CreDtTm
   * LIMIT 1
   * RETURN doc`
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  getDebtorPain001Msgs: (debtorId: string) => Promise<any>;

  /**
   * @param creditorId A creditorId String used to filter on the CreditorAcctId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.CreditorAcctId == ${creditorId}
   * SORT doc.CreDtTm
   * LIMIT 1
   * RETURN doc`
   * ```
   * @memberof TransactionHistoryDB
   */
  getCreditorPain001Msgs: (creditorId: string) => Promise<any>;

  /**
   * @param endToEndId An endToEndId String used to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId == ${endToEndId}
   * FILTER doc.TxSts == 'ACCC'
   * SORT doc.CreDtTm DESC
   * LIMIT 1
   * RETURN doc`
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  getSuccessfulPacs002Msgs: (endToEndId: string) => Promise<any>;

  /**
   * @param endToEndIds An endToEndId Array of String used to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId IN ${endToEndIds}
   * FILTER doc.TxSts == 'ACCC'
   * RETURN doc.EndToEndId`
   * ```
   * Note only returns EndToEndIds of those successful ('ACCC')
   * @memberof TransactionHistoryDB
   */
  getSuccessfulPacs002EndToEndIds: (endToEndIds: string[]) => Promise<any>;

  /**
   * @param endToEndId An endToEndId String used to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId == ${endToEndId}
   * RETURN doc
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  getDebtorPacs002Msgs: (endToEndId: string) => Promise<any>;

  /**
   * @param endToEndIds An endToEndId Array of String used to filter on the EndToEndId field
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.EndToEndId IN ${endToEndIds}
   * SORT doc.EndToEndId DESC
   * RETURN doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.RmtInf.Ustrd
   * ```
   *
   * Note only returns the `CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.RmtInf.Ustrd` field
   * @memberof TransactionHistoryDB
   */
  getEquivalentPain001Msg: (endToEndIds: string[]) => Promise<any>;

  /**
   * @param accountId An accountId String to filter on the provided accountId field
   * @param accountType An accountType Enum to distinguish which type of account to filter to apply: [0 , 1]
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * *FILTER doc.CreditorAcctId == ${accountId} (accountType == 1)
   * *FILTER doc.DebtorAcctId == ${accountId} (accountType == 0)
   * RETURN {
   *  e2eId: doc.EndToEndId,
   *  timestamp: DATE_TIMESTAMP(doc.CreDtTm)
   * }
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  getAccountEndToEndIds: (accountId: string, accountType: AccountType) => Promise<any>;

  /**
   * @param accountId An accountId String to filter on the provided accountId field
   * @param accountType An accountType Enum to distinguish which type of account to filter to apply: [0 , 1]
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * *FILTER doc.CreditorAcctId == ${accountId} (accountType == 1)
   * *FILTER doc.DebtorAcctId == ${accountId} (accountType == 0)
   * RETURN doc
   * ```
   *
   * @memberof TransactionHistoryDB
   */
  getAccountHistoryPacs008Msgs: (accountId: string, accountType: AccountType) => Promise<any>;
}

interface ConfigurationDB {
  _configuration: Database;
  setupConfig: DBConfig;
  nodeCache: NodeCache;

  /**
   * @param collection: Collection name against which this query will be run
   * @param filter: String that will put next to the FILTER keyword to run against Arango
   *
   * This is what the query looks like internally:
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER ${filter}
   * RETURN doc`;
   * ```
   *
   * Note, use "doc." in your query string, as we make use of "doc" as the query and return name.
   * @memberof ConfigurationDB
   */
  queryConfigurationDB: (collection: string, filter: string, limit?: number) => Promise<any>;

  /**
   * Returns rule config
   * @param ruleId A ruleId String used to filter on the id field
   * @param cfg A cfg String used to filter on the cfg field
   * @param limit A limit Number used to limit the amount of results
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.id == ${ruleId}
   * FILTER doc.cfg == ${cfg}
   * *LIMIT ${limit}
   * RETURN doc`
   * ```
   * \* Indicates filter is only applied when parameter is passed in
   * @memberof ConfigurationDB
   */
  getRuleConfig: (ruleId: string, cfg: string, limit?: number) => Promise<any>;
}

interface NetworkMapDB {
  _networkMap: Database;

  /**
   * Finds all active networkmaps
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.active == true
   * RETURN doc
   * ```
   *
   * @memberof NetworkMapDB
   */
  getNetworkMap: () => Promise<any>;
}
interface ManagerStatus {
  /**
   * Returns the status of all services where config was provided.
   *
   * @returns {string | Error} Key-value pair of service and their status
   */
  isReadyCheck: () => any;
}

type DatabaseManagerType = Partial<ManagerStatus & PseudonymsDB & TransactionHistoryDB & ConfigurationDB & NetworkMapDB & RedisService>;

type DatabaseManagerInstance<T extends ManagerConfig> = ManagerStatus &
  (T extends { pseudonyms: DBConfig } ? PseudonymsDB : Record<string, any>) &
  (T extends { transactionHistory: DBConfig } ? TransactionHistoryDB : Record<string, any>) &
  (T extends { configuration: DBConfig } ? ConfigurationDB : Record<string, any>) &
  (T extends { networkMap: DBConfig } ? NetworkMapDB : Record<string, any>) &
  (T extends { redisConfig: RedisConfig } ? RedisService : Record<string, any>);

/**
 * Creates a DatabaseManagerInstance which consists of all optionally configured databases and a redis cache
 *
 * Returns functionality for configured options
 *
 * @param {T} config ManagerStatus | RedisService | PseudonymsDB | TransactionHistoryDB | ConfigurationDB
 * @return {*}  {Promise<DatabaseManagerInstance<T>>}
 */
export async function CreateDatabaseManager<T extends ManagerConfig>(config: T): Promise<DatabaseManagerInstance<T>> {
  const manager: DatabaseManagerType = {};
  readyChecks = {};
  const redis = config.redisConfig ? await redisBuilder(manager, config.redisConfig) : null;

  if (config.pseudonyms) {
    await pseudonymsBuilder(manager, config.pseudonyms);
  }

  if (config.transactionHistory) {
    await transactionHistoryBuilder(manager, config.transactionHistory, redis !== null);
  }

  if (config.configuration) {
    await configurationBuilder(manager, config.configuration);
  }

  if (config.networkMap) {
    await networkMapBuilder(manager, config.networkMap);
  }

  manager.isReadyCheck = () => readyChecks;

  manager.quit = () => {
    redis?.quit();
    manager._pseudonymsDb?.close();
    manager._transactionHistory?.close();
    manager._configuration?.close();
  };

  return manager as DatabaseManagerInstance<T>;
}

async function redisBuilder(manager: DatabaseManagerType, redisConfig: RedisConfig): Promise<RedisService | undefined> {
  try {
    const redis = await RedisService.create(redisConfig);
    manager.getJson = redis.getJson;
    manager.getMembers = redis.getMembers;
    manager.setJson = redis.setJson;
    manager.deleteKey = redis.deleteKey;
    readyChecks.Redis = 'Ok';

    return redis;
  } catch (error) {
    readyChecks.Redis = error;
  }
}

async function pseudonymsBuilder(manager: DatabaseManagerType, pseudonymsConfig: DBConfig): Promise<void> {
  manager._pseudonymsDb = new Database({
    url: pseudonymsConfig.url,
    databaseName: pseudonymsConfig.databaseName,
    auth: {
      username: pseudonymsConfig.user,
      password: pseudonymsConfig.password,
    },
    agentOptions: {
      ca: fs.existsSync(pseudonymsConfig.certPath) ? [fs.readFileSync(pseudonymsConfig.certPath)] : [],
    },
  });

  try {
    await isDatabaseReady(manager._pseudonymsDb);
    readyChecks.PseudonymsDB = 'Ok';
  } catch (err) {
    readyChecks.PseudonymsDB = err;
  }

  manager.queryPseudonymDB = async (collection: string, filter: string, limit?: number) => {
    const db = manager._pseudonymsDb!.collection(collection);
    const aqlFilter = aql`${filter}`;
    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter}
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getPseudonyms = async (hash: string) => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.self);

    const query: AqlQuery = aql`
      FOR i IN ${db}
      FILTER i.pseudonym == ${hash}
      RETURN i
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.addAccount = async (hash: string) => {
    const data = { _key: hash };

    return await manager._pseudonymsDb!.collection(dbPseudonyms.accounts).save(data, { overwriteMode: 'ignore' });
  };

  manager.saveTransactionRelationship = async (tR: TransactionRelationship) => {
    const data = {
      _key: tR.MsgId,
      _from: tR.from,
      _to: tR.to,
      TxTp: tR.TxTp,
      CreDtTm: tR.CreDtTm,
      Amt: tR.Amt,
      Ccy: tR.Ccy,
      PmtInfId: tR.PmtInfId,
      EndToEndId: tR.EndToEndId,
      lat: tR.lat,
      long: tR.long,
    };
    return await manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship).save(data, { overwriteMode: 'ignore' });
  };

  manager.getPacs008Edge = async (endToEndIds: string[]) => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship);

    const query = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId IN ${endToEndIds} && doc.TxTp == 'pacs.008.001.10'
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getPacs008Edges = async (accountId: string, threshold?: string, amount?: number) => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship);
    const account = `accounts/${accountId}`;
    const filters: GeneratedAqlQuery[] = [aql`FILTER doc.TxTp == 'pacs.008.001.10' && doc._to == ${account}`];

    if (threshold !== undefined) filters.push(aql`FILTER doc.CreDtTm < ${threshold}`);
    if (amount !== undefined) filters.push(aql`FILTER doc.Amt == ${amount}`);

    const query = aql`
      FOR doc IN ${db} 
      ${join(filters)}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getPacs002Edge = async (endToEndIds: string[]) => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship);

    const query = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId IN ${endToEndIds} && doc.TxTp == 'pacs.002.001.12'
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getDebtorPacs002Edges = async (debtorId: string): Promise<any> => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship);
    const debtorAccount = `accounts/${debtorId}`;
    const debtorAccountAql = aql`${debtorAccount}`;

    const query = aql`
      FOR doc IN ${db} 
      FILTER doc._from == ${debtorAccountAql}
      FILTER doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC'
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getIncomingPacs002Edges = async (accountId: string, limit?: number): Promise<any> => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship);
    const account = `accounts/${accountId}`;
    const accountAql = aql`${account}`;

    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query = aql`
      FOR doc IN ${db} 
      FILTER doc._to == ${accountAql}
      FILTER doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC'
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getOutgoingPacs002Edges = async (accountId: string, limit?: number): Promise<any> => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship);
    const account = `accounts/${accountId}`;
    const accountAql = aql`${account}`;

    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query = aql`
      FOR doc IN ${db} 
      FILTER doc._from == ${accountAql}
      FILTER doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC'
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getSuccessfulPacs002Edges = async (creditorId: string[], debtorId: string, endToEndId: string[]): Promise<any> => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship);
    const debtorAccount = `accounts/${debtorId}`;
    const debtorAccountAql = aql`${debtorAccount}`;

    const query = aql`
      FOR doc IN ${db} 
      FILTER doc._to IN ${creditorId}  
      FILTER doc._from == ${debtorAccountAql}
      FILTER doc.TxTp == 'pacs.002.001.12' 
      FILTER doc.EndToEndId IN ${endToEndId}
      FILTER doc.TxSts == 'ACCC'
      SORT   doc.CreDtTm DESC
      LIMIT 2
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getDebtorPacs008Edges = async (debtorId: string, endToEndId = '') => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship);
    const debtorAccount = `accounts/${debtorId}`;
    const debtorAccountAql = aql`${debtorAccount}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == ${debtorAccountAql}
      FILTER doc.TxTp == 'pacs.008.001.10' 
      SORT   doc.CreDtTm DESC
      LIMIT 2
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getCreditorPacs008Edges = async (creditorId: string) => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship);
    const creditorAccount = `accounts/${creditorId}`;
    const creditorAccountAql = aql`${creditorAccount}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._to == ${creditorAccountAql} 
      FILTER doc.TxTp == 'pacs.008.001.10' 
      SORT   doc.CreDtTm DESC
      LIMIT 2
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getPreviousPacs008Edges = async (accountId: string, limit?: number, to?: string[]) => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship);

    const filters: GeneratedAqlQuery[] = [];
    filters.push(aql`FILTER doc.TxTp == 'pacs.008.001.10'`);
    if (to !== undefined) filters.push(aql`FILTER doc._to IN ${to}`);

    const aqlLimit = limit ? aql`${limit}` : aql`3`;
    const account = `accounts/${accountId}`;
    const accountAql = aql`${account}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == ${accountAql}
      ${join(filters)}
      SORT doc.CreDtTm DESC
      LIMIT ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getCreditorPacs002Edges = async (creditorId: string, threshold: number) => {
    const db = manager._pseudonymsDb!.collection(dbPseudonyms.transactionRelationship);
    const date: string = new Date(new Date().getTime() - threshold).toISOString();

    const creditorAccount = `accounts/${creditorId}`;
    const creditorAccountAql = aql`${creditorAccount}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == '${creditorAccountAql}' && doc.TxTp == 'pacs.002.001.12' && doc.TxSts == 'ACCC' && doc.CreDtTm >= ${date}
        RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };
}

async function transactionHistoryBuilder(manager: DatabaseManagerType, transactionHistoryConfig: DBConfig, redis: boolean): Promise<void> {
  manager._transactionHistory = new Database({
    url: transactionHistoryConfig.url,
    databaseName: transactionHistoryConfig.databaseName,
    auth: {
      username: transactionHistoryConfig.user,
      password: transactionHistoryConfig.password,
    },
    agentOptions: {
      ca: fs.existsSync(transactionHistoryConfig.certPath) ? [fs.readFileSync(transactionHistoryConfig.certPath)] : [],
    },
  });

  try {
    await isDatabaseReady(manager._transactionHistory);
    readyChecks.TransactionHistoryDB = 'Ok';
  } catch (err) {
    readyChecks.TransactionHistoryDB = err;
  }

  manager.queryTransactionDB = async (collection: string, filter: string, limit?: number) => {
    const db = manager._transactionHistory!.collection(collection);
    const aqlFilter = aql`${filter}`;
    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter}
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  if (redis) {
    manager.getTransactionPacs008 = async (endToEndId: string, cacheKey = '') => {
      let cacheVal: string[] = [];

      if (cacheKey !== '') {
        cacheVal = await manager.getMembers!(cacheKey);
        if (cacheVal.length > 0) return await Promise.resolve(cacheVal);
      }

      const db = manager._transactionHistory!.collection(dbTransactions.pacs008);

      const query: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.EndToEndId == ${endToEndId}
        RETURN doc
      `;

      return await (await manager._transactionHistory!.query(query)).batches.all();
    };
  } else {
    manager.getTransactionPacs008 = async (endToEndId: string) => {
      const db = manager._transactionHistory!.collection(dbTransactions.pacs008);

      const query: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.EndToEndId == ${endToEndId}
        RETURN doc
      `;

      return await (await manager._transactionHistory!.query(query)).batches.all();
    };
  }

  manager.getTransactionPain001 = async (endToEndId: string) => {
    const db = manager._transactionHistory!.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.EndToEndId == ${endToEndId}
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getDebtorPain001Msgs = async (debtorId: string) => {
    const db = manager._transactionHistory!.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.DebtorAcctId == ${debtorId}
      SORT doc.CreDtTm 
      LIMIT 1 
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getCreditorPain001Msgs = async (creditorId: string) => {
    const db = manager._transactionHistory!.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.CreditorAcctId == ${creditorId}
      SORT doc.CreDtTm 
      LIMIT 1
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getSuccessfulPacs002Msgs = async (endToEndId: string) => {
    const db = manager._transactionHistory!.collection(dbTransactions.pacs002);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId == ${endToEndId}
      && doc.TxSts == 'ACCC'
      SORT doc.CreDtTm DESC
      LIMIT 1
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getSuccessfulPacs002EndToEndIds = async (endToEndIds: string[]) => {
    const db = manager._transactionHistory!.collection(dbTransactions.pacs002);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId IN ${endToEndIds}
      FILTER doc.TxSts == 'ACCC'
      RETURN doc.EndToEndId
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getDebtorPacs002Msgs = async (endToEndId: string) => {
    const db = manager._transactionHistory!.collection(dbTransactions.pacs002);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId == ${endToEndId}
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getEquivalentPain001Msg = async (endToEndIds: string[]) => {
    const db = manager._transactionHistory!.collection(dbTransactions.pain001);

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId IN ${endToEndIds}
      SORT  doc.EndToEndId DESC 
      RETURN doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.RmtInf.Ustrd 
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getAccountEndToEndIds = async (accountId: string, accountType: AccountType) => {
    const db = manager._transactionHistory!.collection(dbTransactions.pacs008);
    const filterType =
      accountType === AccountType.CreditorAcct
        ? aql`FILTER doc.CreditorAcctId == ${accountId}`
        : aql`FILTER doc.DebtorAcctId == ${accountId}`;

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      ${filterType}
      RETURN { 
        e2eId: doc.EndToEndId,
        timestamp: DATE_TIMESTAMP(doc.CreDtTm) 
      }
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getAccountHistoryPacs008Msgs = async (accountId: string, accountType: AccountType) => {
    const db = manager._transactionHistory!.collection(dbTransactions.pacs008);
    const filterType =
      accountType === AccountType.CreditorAcct
        ? aql`FILTER doc.CreditorAcctId == ${accountId}`
        : aql`FILTER doc.DebtorAcctId == ${accountId}`;

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      ${filterType}
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };
}

async function configurationBuilder(manager: DatabaseManagerType, configurationConfig: DBConfig): Promise<void> {
  manager._configuration = new Database({
    url: configurationConfig.url,
    databaseName: configurationConfig.databaseName,
    auth: {
      username: configurationConfig.user,
      password: configurationConfig.password,
    },
    agentOptions: {
      ca: fs.existsSync(configurationConfig.certPath) ? [fs.readFileSync(configurationConfig.certPath)] : [],
    },
  });

  try {
    await isDatabaseReady(manager._configuration);
    readyChecks.ConfigurationDB = 'Ok';
  } catch (err) {
    readyChecks.ConfigurationDB = err;
  }

  manager.setupConfig = configurationConfig;
  manager.nodeCache = new NodeCache();

  manager.queryConfigurationDB = async (collection: string, filter: string, limit?: number) => {
    const db = manager._configuration!.collection(collection);
    const aqlFilter = aql`${filter}`;
    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter}
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._configuration!.query(query)).batches.all();
  };

  manager.getRuleConfig = async (ruleId: string, cfg: string, limit?: number) => {
    const cacheKey = `${ruleId}_${cfg}`;
    if (manager.setupConfig?.localCacheEnabled ?? false) {
      const cacheVal = manager.nodeCache?.get(cacheKey);
      if (cacheVal) return await Promise.resolve(cacheVal);
    }
    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;
    const db = manager._configuration!.collection(dbConfiguration.self);
    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.id == ${ruleId}
      FILTER doc.cfg == ${cfg}
      ${aqlLimit}
      RETURN doc
    `;

    const toReturn = await (await manager._configuration!.query(query)).batches.all();
    if (manager.setupConfig?.localCacheEnabled) manager.nodeCache?.set(cacheKey, toReturn, manager.setupConfig?.localCacheTTL ?? 3000);
    return toReturn;
  };
}

async function networkMapBuilder(manager: DatabaseManagerType, NetworkMapConfig: DBConfig): Promise<void> {
  manager._networkMap = new Database({
    url: NetworkMapConfig.url,
    databaseName: NetworkMapConfig.databaseName,
    auth: {
      username: NetworkMapConfig.user,
      password: NetworkMapConfig.password,
    },
    agentOptions: {
      ca: fs.existsSync(NetworkMapConfig.certPath) ? [fs.readFileSync(NetworkMapConfig.certPath)] : [],
    },
  });

  try {
    await isDatabaseReady(manager._networkMap);
    readyChecks.NetworkMapDB = 'Ok';
  } catch (err) {
    readyChecks.NetworkMapDB = err;
  }

  manager.getNetworkMap = async () => {
    const db = manager._configuration!.collection(dbNetworkMap.netConfig);
    const networkConfigurationQuery: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.active == true
        RETURN doc
      `;
    return await (await manager._networkMap!.query(networkConfigurationQuery)).batches.all();
  };
}

async function isDatabaseReady(db: Database | undefined): Promise<boolean> {
  if (!db?.isArangoDatabase || !(await db.exists())) {
    return false;
  }
  return true;
}

export type { ManagerConfig, TransactionHistoryDB, ConfigurationDB, PseudonymsDB, DatabaseManagerInstance, NetworkMapDB };
