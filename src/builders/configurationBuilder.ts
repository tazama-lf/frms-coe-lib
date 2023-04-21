// SPDX-License-Identifier: Apache-2.0

import NodeCache from 'node-cache';
import * as util from 'node:util';
import { Pool, type PoolConfig } from 'pg';
import { isDatabaseReady } from '../builders/utils';
import type { NetworkMap, RuleConfig } from '../interfaces';
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

  manager.getRuleConfig = async (ruleId: string, cfg: string, tenantId: string): Promise<RuleConfig | undefined> => {
    const cacheKey = `${tenantId}_${ruleId}_${cfg}`;
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
                ruleId = $1 
              AND 
                ruleCfg = $2
              AND
                tenantId = $3`,
      values: [ruleId, cfg, tenantId],
    };

    const queryRes = await manager._configuration.query<{ configuration: RuleConfig }>(query);

    const toReturn = queryRes.rows.length > 0 ? queryRes.rows[0].configuration : undefined;
    if (toReturn && manager.nodeCache) {
      manager.nodeCache.set(cacheKey, toReturn, cacheConfig?.localCacheTTL ?? 3000);
    }
    return toReturn;
  };

  manager.getTypologyConfig = async (typologyId: string, typologyCfg: string, tenantId: string): Promise<TypologyConfig | undefined> => {
    const cacheKey = `${tenantId}_${typologyId}_${typologyCfg}`;
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
              typologyId = $1 
            AND 
              typologyCfg = $2
            AND
              tenantId = $3`,
      values: [typologyId, typologyCfg, tenantId],
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
              active = $1`,
      values: [true],
    };

    const queryRes = await manager._configuration.query<{ configuration: NetworkMap }>(query);
    return queryRes.rows.length > 0 ? queryRes.rows.map((value) => value.configuration) : [];
  };

  manager.getPathPushJob = async (path: string, tenantId: string): Promise<Record<string, unknown> | undefined> => {
    const query: PgQueryConfig = {
      text: 'SELECT * FROM tcs_push_jobs WHERE path = $1 AND tenant_id = $2 LIMIT 1;',
      values: [path, tenantId],
    };

    const queryRes = await manager._configuration.query<Record<string, unknown>>(query);
    return queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;
  };

  manager.getDefaultPushJob = async (): Promise<Array<Record<string, unknown>>> => {
    const query: PgQueryConfig = {
      text: "SELECT * FROM tcs_push_jobs WHERE status IN('STATUS_08_DEPLOYED', 'STATUS_06_EXPORTED','STATUS_04_APPROVED') AND publishing_status = 'active'",
      values: [],
    };

    const queryRes = await manager._configuration.query<Record<string, unknown>>(query);
    return queryRes.rows;
  };

  manager.getIdPushJob = async (type: 'push' | 'pull', id: string): Promise<Record<string, unknown> | undefined> => {
    const text =
      type === 'push'
        ? `
          SELECT *
          FROM tcs_push_jobs
          WHERE id = $1
          LIMIT 1;
        `
        : `
        SELECT 
          j.*, 
           s.cron
            FROM tcs_pull_jobs j
             LEFT JOIN tcs_cron_jobs s ON j.schedule_id = s.id
              WHERE j.id = $1
               LIMIT 1;
        `;

    const query: PgQueryConfig = {
      text,
      values: [id],
    };

    const queryRes = await manager._configuration.query<Record<string, unknown>>(query);
    return queryRes.rows.length > 0 ? queryRes.rows[0] : undefined;
  };

  manager.insertJobHistory = async (
    tenantId: string,
    jobId: string,
    counts: number,
    processedCounts: number,
    exception: string | null,
    jobType: string,
  ): Promise<void> => {
    const query: PgQueryConfig = {
      text: 'INSERT INTO job_history (tenant_id, job_id, counts, processed_counts, exception, job_type) VALUES ($1, $2, $3, $4, $5, $6);',
      values: [tenantId, jobId, counts, processedCounts, exception, jobType],
    };

    await manager._configuration.query(query);
  };
}
