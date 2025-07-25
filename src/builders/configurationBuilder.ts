// SPDX-License-Identifier: Apache-2.0

import { aql, Database } from 'arangojs';
import type { AqlQuery } from 'arangojs/aql';
import * as fs from 'node:fs';
import NodeCache from 'node-cache';
import { formatError } from '../helpers/formatter';
import { isDatabaseReady } from '../helpers/readyCheck';
import type { Typology } from '../interfaces';
import { dbConfiguration } from '../interfaces/ArangoCollections';
import { type LocalCacheConfig, readyChecks, type DatabaseManagerType, type DBConfig } from '../services/dbManager';

export async function configurationBuilder(
  manager: DatabaseManagerType,
  configurationConfig: DBConfig,
  cacheConfig?: LocalCacheConfig,
): Promise<void> {
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
    const dbReady = await isDatabaseReady(manager._configuration);
    readyChecks.ConfigurationDB = dbReady ? 'Ok' : 'err';
  } catch (error) {
    const err = error as Error;
    readyChecks.ConfigurationDB = `err, ${formatError(err)}`;
  }

  manager.setupConfig = configurationConfig;
  manager.nodeCache = cacheConfig?.localCacheEnabled ? new NodeCache() : undefined;

  manager.queryConfigurationDB = async (collection: string, filter: string, limit?: number) => {
    const db = manager._configuration?.collection(collection);
    const aqlFilter = aql`${filter}`;
    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;

    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER ${aqlFilter}
      ${aqlLimit}
      RETURN doc
    `;

    return await (await manager._configuration?.query(query))?.batches.all();
  };

  manager.getRuleConfig = async (ruleId: string, cfg: string, limit?: number) => {
    const cacheKey = `${ruleId}_${cfg}`;
    if (cacheConfig?.localCacheEnabled ?? false) {
      const cacheVal = manager.nodeCache?.get(cacheKey);
      if (cacheVal) return await Promise.resolve(cacheVal);
    }
    const aqlLimit = limit ? aql`LIMIT ${limit}` : undefined;
    const db = manager._configuration?.collection(dbConfiguration.ruleConfiguration);
    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.id == ${ruleId}
      FILTER doc.cfg == ${cfg}
      ${aqlLimit}
      RETURN doc
    `;

    const toReturn = await (await manager._configuration?.query(query))?.batches.all();
    if (cacheConfig?.localCacheEnabled && toReturn?.[0] && toReturn[0].length === 1) {
      manager.nodeCache?.set(cacheKey, toReturn, cacheConfig?.localCacheTTL ?? 3000);
    }
    return toReturn;
  };

  manager.getTransactionConfig = async (transctionId: string, cfg: string) => {
    const cacheKey = `${transctionId}_${cfg}`;
    if (cacheConfig?.localCacheEnabled ?? false) {
      const cacheVal = manager.nodeCache?.get(cacheKey);
      if (cacheVal) return await Promise.resolve(cacheVal);
    }

    const db = manager._configuration?.collection(dbConfiguration.transactionConfiguration);
    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.id == ${transctionId}
      FILTER doc.cfg == ${cfg}
      RETURN doc
    `;

    const toReturn = await (await manager._configuration?.query(query))?.batches.all();
    if (cacheConfig?.localCacheEnabled && toReturn?.[0] && toReturn[0].length === 1) {
      manager.nodeCache?.set(cacheKey, toReturn, cacheConfig?.localCacheTTL ?? 3000);
    }
    return toReturn;
  };

  manager.getTypologyConfig = async (typology: Typology) => {
    const cacheKey = `${typology.id}_${typology.cfg}`;
    if (cacheConfig?.localCacheEnabled ?? false) {
      const cacheVal = manager.nodeCache?.get(cacheKey);
      if (cacheVal) return await Promise.resolve(cacheVal);
    }
    const db = manager._configuration?.collection(dbConfiguration.typologyConfiguration);
    const query: AqlQuery = aql`
      FOR doc IN ${db}
      FILTER doc.id == ${typology.id} AND doc.cfg == ${typology.cfg}
      RETURN doc
    `;

    const toReturn = await (await manager._configuration?.query(query))?.batches.all();
    if (cacheConfig?.localCacheEnabled && toReturn?.[0] && toReturn[0].length === 1) {
      manager.nodeCache?.set(cacheKey, toReturn, cacheConfig?.localCacheTTL ?? 3000);
    }
    return toReturn;
  };

  manager.getNetworkMap = async () => {
    const db = manager._configuration?.collection(dbConfiguration.networkConfiguration);
    const networkConfigurationQuery: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.active == true
        RETURN doc
      `;
    return await (await manager._configuration?.query(networkConfigurationQuery))?.batches.all();
  };
}
