import { aql, Database } from "arangojs";
import { type AqlQuery } from "arangojs/aql";
import * as fs from "fs";
import { type TransactionRelationship } from "../interfaces";
import { RedisService, type RedisConfig } from "..";
import NodeCache from "node-cache";

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
  redisConfig: RedisConfig;
}

interface PseudonymsDB {
  _pseudonymsDb: Database;
  getPseudonyms: (hash: string) => Promise<any>;
  addAccount: (hash: string) => Promise<any>;
  // addEntity: (entityId: string, CreDtTm: string) => Promise<any>;
  // addAccountHolder: (entityId: string, accountId: string, CreDtTm: string) => Promise<any>;
  saveTransactionRelationship: (tR: TransactionRelationship) => Promise<any>;
}

interface TransactionHistoryDB {
  _transactionHistory: Database;
  getTransactionPacs008: (endToEndId: string, cacheKey?: string) => Promise<any>;
  getDebitorPain001Msgs: (creditorId: string) => Promise<any>;
  getCreditorPain001Msgs: (creditorId: string) => Promise<any>;
  getSuccessfulPacs002Msgs: (pain001Id: string) => Promise<any>;
}

interface ConfigurationDB {
  _configuration: Database;
  setupConfig: DBConfig;
  nodeCache: NodeCache;
  getRuleConfig: (ruleId: string, cfg: string) => Promise<any>;
}

type DatabaseManagerInstance<T extends ManagerConfig> = (T extends {
  pseudonyms: DBConfig;
}
  ? PseudonymsDB
  : Record<string, any>) &
  (T extends { transactionHistory: DBConfig } ? TransactionHistoryDB : Record<string, any>) &
  (T extends { configuration: DBConfig } ? ConfigurationDB : Record<string, any>) &
  (T extends { redisConfig: RedisConfig } ? RedisService : Record<string, any>);

/**
 * Creates a DatabaseManagerInstance which consists of a redis service and optionally configured databases
 *
 * @param {T} config RedisConfig & PseudonymsDB | TransactionHistoryDB | ConfigurationDB
 * @return {*}  {Promise<DatabaseManagerInstance<T>>}
 */
export async function CreateDatabaseManager<T extends ManagerConfig>(config: T): Promise<DatabaseManagerInstance<T>> {
  const redis: RedisService = await RedisService.create(config.redisConfig);
  const manager: Partial<PseudonymsDB & TransactionHistoryDB & ConfigurationDB & RedisService> = {};

  manager.getJson = redis.getJson;
  manager.setJson = redis.setJson;
  manager.deleteKey = redis.deleteKey;
  manager.quit = () => {
    redis.quit();
    manager._pseudonymsDb?.close();
    manager._transactionHistory?.close();
    manager._configuration?.close();
  };

  if (config.pseudonyms != null) {
    manager._pseudonymsDb = new Database({
      url: config.pseudonyms.url,
      databaseName: config.pseudonyms.databaseName,
      auth: {
        username: config.pseudonyms.user,
        password: config.pseudonyms.password,
      },
      agentOptions: {
        ca: fs.existsSync(config.pseudonyms.certPath) ? [fs.readFileSync(config.pseudonyms.certPath)] : [],
      },
    });

    if (config.configuration != null) {
      manager.setupConfig = config.configuration;
      manager.nodeCache = new NodeCache();
    }

    manager.getPseudonyms = async (hash: string) => {
      const db = "pseudonyms";

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

  if (config.transactionHistory != null) {
    manager._transactionHistory = new Database({
      url: config.transactionHistory.url,
      databaseName: config.transactionHistory.databaseName,
      auth: {
        username: config.transactionHistory.user,
        password: config.transactionHistory.password,
      },
      agentOptions: {
        ca: fs.existsSync(config.transactionHistory.certPath) ? [fs.readFileSync(config.transactionHistory.certPath)] : [],
      },
    });

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
      const db = "transactionHistoryPain001";

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
      const db = "transactionHistoryPacs002";

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

  if (config.configuration != null) {
    manager._configuration = new Database({
      url: config.configuration.url,
      databaseName: config.configuration.databaseName,
      auth: {
        username: config.configuration.user,
        password: config.configuration.password,
      },
      agentOptions: {
        ca: fs.existsSync(config.configuration.certPath) ? [fs.readFileSync(config.configuration.certPath)] : [],
      },
    });

    manager.getRuleConfig = async (ruleId: string, cfg: string) => {
      const cacheKey = `${ruleId}_${cfg}`;
      if (manager.setupConfig?.localCacheEnabled ?? false) {
        const cacheVal = manager.nodeCache?.get(cacheKey);
        if (cacheVal) return await Promise.resolve(cacheVal);
      }
      const db = "configuration";
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

  return manager as DatabaseManagerInstance<T>;
}

export type { ManagerConfig, TransactionHistoryDB, ConfigurationDB, PseudonymsDB, DatabaseManagerInstance };
