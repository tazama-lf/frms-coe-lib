/* eslint-disable @typescript-eslint/no-explicit-any */

import { aql, Database } from "arangojs";
import { type AqlQuery } from "arangojs/aql";
import * as fs from "fs";
import NodeCache from "node-cache";
import { RedisService, type RedisConfig } from "..";
import { type TransactionRelationship } from "../interfaces";

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
  getPseudonymGeneric: (collection: string, filter: string) => Promise<any>;
  getPseudonyms: (hash: string) => Promise<any>;
  addAccount: (hash: string) => Promise<any>;
  // addEntity: (entityId: string, CreDtTm: string) => Promise<any>;
  // addAccountHolder: (entityId: string, accountId: string, CreDtTm: string) => Promise<any>;
  saveTransactionRelationship: (tR: TransactionRelationship) => Promise<any>;
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
  getTransactionGeneric: (collection: string, filter: string) => Promise<any>;
  getTransactionPacs008: (endToEndId: string, cacheKey?: string) => Promise<any>;
  getDebitorPain001Msgs: (creditorId: string) => Promise<any>;
  getCreditorPain001Msgs: (creditorId: string) => Promise<any>;
  getSuccessfulPacs002Msgs: (pain001Id: string) => Promise<any>;
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
  getConfigurationGeneric: (collection: string, filter: string) => Promise<any>;
  getRuleConfig: (ruleId: string, cfg: string) => Promise<any>;
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

  manager.getPseudonymGeneric = async (collection: string, filter: string) => {
    const db = manager._pseudonymsDb!.collection(collection);
    const aqlFilter = aql`${filter}`;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter}
      RETURN doc
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.getPseudonyms = async (hash: string) => {
    const db = manager._pseudonymsDb!.collection("pseudonyms");

    const query: AqlQuery = aql`
      FOR i IN ${db}
      FILTER i.pseudonym == ${hash}
      RETURN i
    `;

    return await (await manager._pseudonymsDb!.query(query)).batches.all();
  };

  manager.addAccount = async (hash: string) => {
    const data = { _key: hash };

    return await manager._pseudonymsDb!.collection("accounts").save(data, { overwriteMode: "ignore" });
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

    return await manager._pseudonymsDb!.collection("transactionRelationship").save(data, { overwriteMode: "ignore" });
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

  manager.getTransactionGeneric = async (collection: string, filter: string) => {
    const db = manager._transactionHistory!.collection(collection);
    const aqlFilter = aql`${filter}`;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter}
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  if (redis) {
    manager.getTransactionPacs008 = async (endToEndId: string, cacheKey = "") => {
      let cacheVal: string[] = [];

      if (cacheKey !== "") {
        cacheVal = await manager.getJson!(cacheKey);
        if (cacheVal.length > 0) return await Promise.resolve(cacheVal);
      }

      const db = manager._transactionHistory!.collection("transactionHistoryPacs008");

      const query: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.EndToEndId == ${endToEndId}
        RETURN doc
      `;

      return await (await manager._transactionHistory!.query(query)).batches.all();
    };
  } else {
    manager.getTransactionPacs008 = async (endToEndId: string) => {
      const db = manager._transactionHistory!.collection("transactionHistoryPacs008");

      const query: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.EndToEndId == ${endToEndId}
        RETURN doc
      `;

      return await (await manager._transactionHistory!.query(query)).batches.all();
    };
  }

  manager.getDebitorPain001Msgs = async (creditorId: string) => {
    const db = manager._transactionHistory!.collection("transactionHistoryPain001");

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
    const db = manager._transactionHistory!.collection("transactionHistoryPain001");

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.CreditorAcctId == ${creditorId}
      SORT doc.CreDtTm 
      LIMIT 1
      RETURN doc
    `;

    return await (await manager._transactionHistory!.query(query)).batches.all();
  };

  manager.getSuccessfulPacs002Msgs = async (pain001Id: string) => {
    const db = manager._transactionHistory!.collection("transactionHistoryPacs002");

    const query: AqlQuery = aql`
      FOR doc IN ${db} 
      FILTER doc.EndToEndId == ${pain001Id}
      && doc.TxSts == 'ACCC'
      SORT doc.FIToFIPmtSts.GrpHdr.CreDtTm DESC
      LIMIT 1
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

  manager.getConfigurationGeneric = async (collection: string, filter: string) => {
    const db = manager._configuration!.collection(collection);
    const aqlFilter = aql`${filter}`;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter}
      RETURN doc
    `;

    return await (await manager._configuration!.query(query)).batches.all();
  };

  manager.getRuleConfig = async (ruleId: string, cfg: string) => {
    const cacheKey = `${ruleId}_${cfg}`;
    if (manager.setupConfig?.localCacheEnabled ?? false) {
      const cacheVal = manager.nodeCache?.get(cacheKey);
      if (cacheVal) return await Promise.resolve(cacheVal);
    }
    const db = manager._configuration!.collection("configuration");
    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.id == ${ruleId}
      FILTER doc.cfg == ${cfg}
      RETURN doc
    `;

    const toReturn = (await manager._configuration!.query(query)).batches.all();
    if (manager.setupConfig?.localCacheEnabled) manager.nodeCache?.set(cacheKey, toReturn, manager.setupConfig?.localCacheTTL ?? 3000);

    return await toReturn;
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
