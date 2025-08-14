// SPDX-License-Identifier: Apache-2.0

import NodeCache from 'node-cache';
import * as util from 'node:util';
import { Pool, type PoolConfig } from 'pg';
import { isDatabaseReady } from '../helpers/readyCheck';
import type { NetworkMap, RuleConfig, Typology } from '../interfaces';
import type { PgQueryConfig } from '../interfaces/database';
import type { TypologyConfig } from '../interfaces/processor-files/TypologyConfig';
import type { ConfigurationDB, DBConfig, LocalCacheConfig } from '../services/dbManager';
import { readyChecks } from '../services/dbManager';
import { getSSLConfig } from './utils';

export async function configurationBuilder(
  manager: ConfigurationDB,
  configurationConfig: DBConfig,
  cacheConfig?: LocalCacheConfig,
): Promise<void> {
  const conf: PoolConfig = {
    host: configurationConfig.host,
    port: configurationConfig.port,
    database: configurationConfig.databaseName,
    user: configurationConfig.user,
    password: configurationConfig.password,
    ssl: getSSLConfig(configurationConfig.certPath),
  } as const;

  manager._configuration = new Pool(conf);

  try {
    const dbReady = await isDatabaseReady(manager._configuration);
    readyChecks.ConfigurationDB = dbReady ? 'Ok' : 'err';
  } catch (error) {
    const err = error as Error;
    readyChecks.ConfigurationDB = `err, ${util.inspect(err)}`;
  }

  manager.nodeCache = cacheConfig?.localCacheEnabled ? new NodeCache() : undefined;

  manager.getRuleConfig = async (ruleId: string, cfg: string, limit?: number): Promise<RuleConfig | undefined> => {
    const cacheKey = `${ruleId}_${cfg}`;
    if (manager.nodeCache) {
      const cacheVal = manager.nodeCache.get<RuleConfig>(cacheKey);
      if (cacheVal) {
        return cacheVal;
      }
    }

    const query: PgQueryConfig = {
      text: `SELECT 
                configuration
              FROM 
                rule 
              WHERE 
                ruleId = $1 AND ruleCfg = $2`,
      values: [ruleId, cfg],
    };

    if (limit !== undefined) {
      query.text += ' LIMIT $4'; // $4 IS NULL OR LIMIT $4
      query.values.push(limit);
    }

    const queryRes = await manager._configuration.query<{ configuration: RuleConfig }>(query);

    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].configuration : undefined;
    if (toReturn && manager.nodeCache) {
      manager.nodeCache.set(cacheKey, toReturn, cacheConfig?.localCacheTTL ?? 3000);
    }
    return toReturn;
  };

  manager.getTypologyConfig = async (typology: Typology): Promise<TypologyConfig | undefined> => {
    const cacheKey = `${typology.id}_${typology.cfg}`;
    if (manager.nodeCache) {
      const cacheVal = manager.nodeCache.get<TypologyConfig>(cacheKey);
      if (cacheVal) return await Promise.resolve(cacheVal);
    }
    const query: PgQueryConfig = {
      text: `SELECT
              configuration
            FROM
              typology
            WHERE
              typologyId = $1 AND typologyCfg = $2`,
      values: [typology.id, typology.cfg],
    };

    const queryRes = await manager._configuration.query<{ configuration: TypologyConfig }>(query);

    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].configuration : undefined;
    if (toReturn && manager.nodeCache) {
      manager.nodeCache.set(cacheKey, toReturn, cacheConfig?.localCacheTTL ?? 3000);
    }
    return toReturn;
  };

  manager.getNetworkMap = async (): Promise<NetworkMap[]> => {
    const query: PgQueryConfig = {
      text: `SELECT
              configuration
            FROM
              network_map
            WHERE
              configuration->'active' = $1`,
      values: [true],
    };

    const queryRes = await manager._configuration.query<{ configuration: NetworkMap }>(query);
    return queryRes.rows.length > 0 ? queryRes.rows.map((value) => value.configuration) : [];
  };
}
