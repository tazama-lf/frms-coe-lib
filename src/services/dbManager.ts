/* eslint-disable @typescript-eslint/no-explicit-any */

import { aql, Database } from 'arangojs';
import { join, type AqlQuery, type GeneratedAqlQuery } from 'arangojs/aql';
import * as fs from 'fs';
import NodeCache from 'node-cache';
import { RedisService, type RedisConfig } from '..';
import { AccountType, type TransactionRelationship } from '../interfaces';

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
  redisConfig?: RedisConfig;
  networkMap?: DBConfig;
}

interface PseudonymsDB {
  _pseudonymsDb: Database;

  /**
   * @param collection: this is a Collection name against which this query will be run
   * @param filter: this is a string that will put next to the FILTER keyword to run against Arango
   *
   * This is what the query looks like internally:
   *
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER ${filter}
   * RETURN doc`;
   *
   * Note, use "doc." in your query string, as we make use of "doc" as the query and return name.
   * @memberof PseudonymsDB
   */
  queryPseudonymDB: (collection: string, filter: string, limit?: number) => Promise<any>;
  getPseudonyms: (hash: string) => Promise<any>;
  addAccount: (hash: string) => Promise<any>;
  // addEntity: (entityId: string, CreDtTm: string) => Promise<any>;
  // addAccountHolder: (entityId: string, accountId: string, CreDtTm: string) => Promise<any>;
  saveTransactionRelationship: (tR: TransactionRelationship) => Promise<any>;
  getPacs008Edge: (endToEndIds: string[]) => Promise<any>;
  getPacs008Edges: (creditorId: string, threshold: string, amount: number) => Promise<any>;
  getPacs002Edge: (endToEndIds: string[]) => Promise<any>;
  getDebtorPacs002Edges: (debtorId: string) => Promise<any>;
  getSuccessfulPacs002Edges: (creditorId: string[], debtorId: string, endToEndId: string[]) => Promise<any>;
  getDebtorPacs008Edges: (debtorId: string, endToEndId: string) => Promise<any>;
  getCreditorPacs008Edges: (creditorId: string) => Promise<any>;
  getPreviousPacs008Edges: (debtorId: string, limit?: number, to?: string[]) => Promise<any>;
  getCreditorPacs002Edges: (creditorId: string, threshold: number) => Promise<any>;
}

interface TransactionHistoryDB {
  _transactionHistory: Database;

  /**
   * @param collection: this is a Collection name against which this query will be run
   * @param filter: this is a string that will put next to the FILTER keyword to run against Arango
   *
   * This is what the query looks like internally:
   *
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER ${filter}
   * RETURN doc`;
   *
   * Note, use "doc." in your query string, as we make use of "doc" as the query and return name.
   * @memberof TransactionHistoryDB
   */
  queryTransactionDB: (collection: string, filter: string, limit?: number) => Promise<any>;
  getTransactionPacs008: (endToEndId: string, cacheKey?: string) => Promise<any>;
  getDebtorPain001Msgs: (debtorId: string) => Promise<any>;
  getCreditorPain001Msgs: (creditorId: string) => Promise<any>;
  getSuccessfulPacs002Msgs: (endToEndId: string) => Promise<any>;
  getSuccessfulPacs002EndToEndIds: (endToEndIds: string[]) => Promise<any>;
  getDebtorPacs002Msgs: (endToEndId: string) => Promise<any>;
  getEquivalentPain001Msg: (endToEndIds: string[]) => Promise<any>;
  getAccountEndToEndIds: (accountId: string, accountType: AccountType) => Promise<any>;
  getAccountHistoryPacs008Msgs: (accountId: string, accountType: AccountType) => Promise<any>;
}

interface ConfigurationDB {
  _configuration: Database;
  setupConfig: DBConfig;
  nodeCache: NodeCache;

  /**
   * @param collection: this is a Collection name against which this query will be run
   * @param filter: this is a string that will put next to the FILTER keyword to run against Arango
   *
   * This is what the query looks like internally:
   *
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER ${filter}
   * RETURN doc`;
   *
   * Note, use "doc." in your query string, as we make use of "doc" as the query and return name.
   * @memberof ConfigurationDB
   */
  queryConfigurationDB: (collection: string, filter: string, limit?: number) => Promise<any>;
  getRuleConfig: (ruleId: string, cfg: string, limit?: number) => Promise<any>;
}

interface NetworkMapDB {
  _networkMap: Database;
  getNetworkMap: () => Promise<any>;
}

type DatabaseManagerType = Partial<PseudonymsDB & TransactionHistoryDB & ConfigurationDB & NetworkMapDB & RedisService>;

type DatabaseManagerInstance<T extends ManagerConfig> = (T extends {
  pseudonyms: DBConfig;
}
  ? PseudonymsDB
  : Record<string, any>) &
  (T extends { transactionHistory: DBConfig } ? TransactionHistoryDB : Record<string, any>) &
  (T extends { configuration: DBConfig } ? ConfigurationDB : Record<string, any>) &
  (T extends { networkMap: DBConfig } ? NetworkMapDB : Record<string, any>) &
  (T extends { redisConfig: RedisConfig } ? RedisService : Record<string, any>);

/**
 * Creates a DatabaseManagerInstance which consists of all optionally configured databases and a redis cache
 *
 * Returns functionality for configured options
 *
 * @param {T} config RedisService | PseudonymsDB | TransactionHistoryDB | ConfigurationDB
 * @return {*}  {Promise<DatabaseManagerInstance<T>>}
 */
export async function CreateDatabaseManager<T extends ManagerConfig>(config: T): Promise<DatabaseManagerInstance<T>> {
  const manager: DatabaseManagerType = {};
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

  manager.quit = () => {
    redis?.quit();
    manager._pseudonymsDb?.close();
    manager._transactionHistory?.close();
    manager._configuration?.close();
  };

  return manager as DatabaseManagerInstance<T>;
}

async function redisBuilder(manager: DatabaseManagerType, redisConfig: RedisConfig): Promise<RedisService> {
  const redis = await RedisService.create(redisConfig);
  manager.getJson = redis.getJson;
  manager.setJson = redis.setJson;
  manager.deleteKey = redis.deleteKey;

  return redis;
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
    const db = manager._pseudonymsDb!.collection('pseudonyms');

    const query: AqlQuery = aql`
      FOR i IN ${db}
      FILTER i.pseudonym == ${hash}
      RETURN i
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.addAccount = async (hash: string) => {
    const data = { _key: hash };

    return await manager._pseudonymsDb!.collection('accounts').save(data, { overwriteMode: 'ignore' });
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

    return await manager._pseudonymsDb!.collection('transactionRelationship').save(data, { overwriteMode: 'ignore' });
  };

  manager.getPacs008Edge = async (endToEndIds: string[]) => {
    const db = manager._pseudonymsDb!.collection('transactionRelationship');

    const query = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId IN ${JSON.stringify(endToEndIds)} && doc.TxTp == 'pacs.008.001.10'
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getPacs008Edges = async (creditorId: string, threshold?: string, amount?: number) => {
    const db = manager._pseudonymsDb!.collection('transactionRelationship');
    const filters: GeneratedAqlQuery[] = [aql`FILTER doc.TxTp == 'pacs.008.001.10' && doc._to == ${creditorId}`];

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
    const db = manager._pseudonymsDb!.collection('transactionRelationship');

    const query = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId IN ${JSON.stringify(endToEndIds)} && doc.TxTp == 'pacs.002.001.12'
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getDebtorPacs002Edges = async (debtorId: string): Promise<any> => {
    const db = manager._pseudonymsDb!.collection('transactionRelationship');
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

  manager.getSuccessfulPacs002Edges = async (creditorId: string[], debtorId: string, endToEndId: string[]): Promise<any> => {
    const db = manager._pseudonymsDb!.collection('transactionRelationship');
    const debtorAccount = `accounts/${debtorId}`;
    const debtorAccountAql = aql`${debtorAccount}`;

    const query = aql`
      FOR doc IN ${db} 
      FILTER doc._to IN ${JSON.stringify(creditorId)}  
      FILTER doc._from == ${debtorAccountAql}
      FILTER doc.TxTp == 'pacs.002.001.12' 
      FILTER doc.EndToEndId IN ${JSON.stringify(endToEndId)}
      FILTER doc.TxSts == 'ACCC'
      SORT   doc.CreDtTm DESC
      LIMIT 2
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getDebtorPacs008Edges = async (debtorId: string, endToEndId: string) => {
    const db = manager._pseudonymsDb!.collection('transactionRelationship');
    const debtorAccount = `accounts/${debtorId}`;
    const debtorAccountAql = aql`${debtorAccount}`;

    const query = aql`
      FOR doc IN ${db}
      FILTER doc._from == ${debtorAccountAql}
      FILTER doc.EndToEndId ==  ${endToEndId}
      FILTER doc.TxTp == 'pacs.008.001.10' 
      SORT   doc.CreDtTm DESC
      LIMIT 2
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getCreditorPacs008Edges = async (creditorId: string) => {
    const db = manager._pseudonymsDb!.collection('transactionRelationship');
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
    const db = manager._pseudonymsDb!.collection('transactionRelationship');

    const filters: GeneratedAqlQuery[] = [];
    filters.push(aql`FILTER doc.TxTp == 'pacs.008.001.10'`);
    if (to !== undefined) filters.push(aql`FILTER doc._to IN ${JSON.stringify(to)}`);

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
    const db = manager._pseudonymsDb!.collection('transactionRelationship');
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
        cacheVal = await manager.getJson!(cacheKey);
        if (cacheVal.length > 0) return await Promise.resolve(cacheVal);
      }

      const db = manager._transactionHistory!.collection('transactionHistoryPacs008');

      const query: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.EndToEndId == ${endToEndId}
        RETURN doc
      `;

      return await (await manager._transactionHistory!.query(query)).batches.all();
    };
  } else {
    manager.getTransactionPacs008 = async (endToEndId: string) => {
      const db = manager._transactionHistory!.collection('transactionHistoryPacs008');

      const query: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.EndToEndId == ${endToEndId}
        RETURN doc
      `;

      return await (await manager._transactionHistory!.query(query)).batches.all();
    };
  }

  manager.getDebtorPain001Msgs = async (creditorId: string) => {
    const db = manager._transactionHistory!.collection('transactionHistoryPain001');

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.DebtorAcctId == ${creditorId}
      SORT doc.CreDtTm 
      LIMIT 1 
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getCreditorPain001Msgs = async (creditorId: string) => {
    const db = manager._transactionHistory!.collection('transactionHistoryPain001');

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
    const db = manager._transactionHistory!.collection('transactionHistoryPacs002');

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId == ${endToEndId}
      && doc.TxSts == 'ACCC'
      SORT doc.FIToFIPmtSts.GrpHdr.CreDtTm DESC
      LIMIT 1
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getSuccessfulPacs002EndToEndIds = async (endToEndIds: string[]) => {
    const db = manager._transactionHistory!.collection('transactionHistoryPacs002');

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId IN ${JSON.stringify(endToEndIds)}
      FILTER doc.TxSts == 'ACCC'
      RETURN doc.EndToEndId
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getDebtorPacs002Msgs = async (endToEndId: string) => {
    const db = manager._transactionHistory!.collection('transactionHistoryPacs002');

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId == ${endToEndId}
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getEquivalentPain001Msg = async (endToEndIds: string[]) => {
    const db = manager._transactionHistory!.collection('transactionHistoryPain001');

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId IN ${JSON.stringify(endToEndIds)}
      SORT  doc.EndToEndId DESC 
      RETURN doc.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.RmtInf.Ustrd 
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getAccountEndToEndIds = async (accountId: string, accountType: AccountType) => {
    const db = manager._transactionHistory!.collection('transactionHistoryPacs008');
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
    const db = manager._transactionHistory!.collection('transactionHistoryPacs008');
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
    const db = manager._configuration!.collection('configuration');
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

  manager.getNetworkMap = async () => {
    const networkConfigurationQuery: AqlQuery = aql`
        FOR doc IN networkConfiguration
        FILTER doc.active == true
        RETURN doc
      `;
    return await (await manager._networkMap!.query(networkConfigurationQuery)).batches.all();
  };
}

export type { ManagerConfig, TransactionHistoryDB, ConfigurationDB, PseudonymsDB, DatabaseManagerInstance, NetworkMapDB };
