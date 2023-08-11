import { aql, Database } from 'arangojs';
import { type AqlQuery } from 'arangojs/aql';
import * as fs from 'fs';
import NodeCache from 'node-cache';
import { dbConfiguration } from '../interfaces/ArangoCollections';
import { type DatabaseManagerType, type DBConfig, readyChecks } from '../services/dbManager';
import { isDatabaseReady } from '../helpers/readyCheck';
import { type Typology } from '../interfaces';

export async function configurationBuilder(manager: DatabaseManagerType, configurationConfig: DBConfig): Promise<void> {
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
    readyChecks.ConfigurationDB = (await isDatabaseReady(manager._configuration)) ? 'Ok' : 'err';
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
    if (manager.setupConfig?.localCacheEnabled && toReturn[0] && toReturn[0].length === 1)
      manager.nodeCache?.set(cacheKey, toReturn, manager.setupConfig?.localCacheTTL ?? 3000);
    return toReturn;
  };

  manager.getTransactionConfig = async () => {
    const db = manager._configuration!.collection(dbConfiguration.self);
    const query: AqlQuery = aql`
      FOR doc IN ${db}
      RETURN UNSET(doc, "_id", "_key", "_rev")
    `;

    return await (await manager._configuration!.query(query)).batches.all();
  };

  manager.getTypologyExpression = async (typology: Typology) => {
    const cacheKey = `${typology.id}_${typology.cfg}`;
    if (manager.setupConfig?.localCacheEnabled ?? false) {
      const cacheVal = manager.nodeCache?.get(cacheKey);
      if (cacheVal) return await Promise.resolve(cacheVal);
    }
    const db = manager._configuration!.collection(dbConfiguration.typologyExpression);
    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.id == "${typology.id}" AND doc.cfg == "${typology.cfg}"
      RETURN doc
    `;

    const toReturn = await (await manager._configuration!.query(query)).batches.all();
    if (manager.setupConfig?.localCacheEnabled && toReturn[0] && toReturn[0].length === 1)
      manager.nodeCache?.set(cacheKey, toReturn, manager.setupConfig?.localCacheTTL ?? 3000);
    return toReturn;
  };
}
