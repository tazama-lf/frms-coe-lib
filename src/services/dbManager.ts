// SPDX-License-Identifier: Apache-2.0

import * as util from 'node:util';
import type { RedisService } from '..';
import { configurationBuilder } from '../builders/configurationBuilder';
import { evaluationBuilder } from '../builders/evaluationBuilder';
import { eventHistoryBuilder } from '../builders/eventHistoryBuilder';
import { rawHistoryBuilder } from '../builders/rawHistoryBuilder';
import { redisBuilder } from '../builders/redisBuilder';
import { type Database, validateDatabaseConfig } from '../config/database.config';
import { validateLocalCacheConfig } from '../config/index';
import { Cache, validateRedisConfig } from '../config/redis.config';
import type { RedisConfig } from '../interfaces';
import type { ConfigurationDB } from '../interfaces/database/ConfigurationDB';
import type { EvaluationDB } from '../interfaces/database/EvaluationDB';
import type { EventHistoryDB } from '../interfaces/database/EventHistoryDB';
import type { RawHistoryDB } from '../interfaces/database/RawHistoryDB';

export let readyChecks: Record<string, unknown> = {};

export interface DBConfig {
  host: string;
  port?: number;
  user: string;
  password: string;
  databaseName: string;
  certPath: string;
}

export interface LocalCacheConfig {
  localCacheEnabled?: boolean;
  localCacheTTL?: number;
}

interface ManagerConfig {
  eventHistory?: DBConfig;
  rawHistory?: DBConfig;
  evaluation?: DBConfig;
  configuration?: DBConfig;
  redisConfig?: RedisConfig;
  localCacheConfig?: LocalCacheConfig;
}

interface ManagerStatus {
  /**
   * Returns the status of all services where config was provided.
   *
   * @returns {string | Error} Key-value pair of service and their status
   */
  isReadyCheck: () => unknown;
  quit: () => unknown;
}

export type DatabaseManagerType = Partial<ManagerStatus & EventHistoryDB & RawHistoryDB & EvaluationDB & ConfigurationDB & RedisService>;

type DatabaseManagerInstance<T extends ManagerConfig> = ManagerStatus &
  (T extends { eventHistory: DBConfig } ? EventHistoryDB : Record<string, unknown>) &
  (T extends { rawHistory: DBConfig } ? RawHistoryDB : Record<string, unknown>) &
  (T extends { evaluation: DBConfig } ? EvaluationDB : Record<string, unknown>) &
  (T extends { configuration: DBConfig } ? ConfigurationDB : Record<string, unknown>) &
  (T extends { redisConfig: RedisConfig } ? RedisService : Record<string, unknown>);

/**
 * Creates a DatabaseManagerInstance which consists of all optionally configured databases and a redis cache
 *
 * Returns functionality for configured options
 *
 * @param {T} config ManagerStatus | RedisService | EventHistoryDB | RawHistoryDB | ConfigurationDB
 * @return {*}  {Promise<DatabaseManagerInstance<T>>}
 */
export async function CreateDatabaseManager<T extends ManagerConfig>(config: T): Promise<DatabaseManagerInstance<T>> {
  const manager: DatabaseManagerType = {};
  readyChecks = {};
  const redis = config.redisConfig ? await redisBuilder(manager, config.redisConfig) : null;

  if (config.eventHistory) {
    await eventHistoryBuilder(manager as EventHistoryDB, config.eventHistory);
  }

  if (config.rawHistory) {
    await rawHistoryBuilder(manager as RawHistoryDB, config.rawHistory);
  }

  if (config.evaluation) {
    await evaluationBuilder(manager as EvaluationDB, config.evaluation);
  }

  if (config.configuration) {
    await configurationBuilder(manager as ConfigurationDB, config.configuration, config.localCacheConfig);
  }

  manager.isReadyCheck = () => readyChecks;

  manager.quit = () => {
    redis?.quit();
    manager._configuration?.end();
    manager._eventHistory?.end();
    manager._rawHistory?.end();
    manager._evaluation?.end();
  };

  if (Object.values(readyChecks).some((status) => status !== 'Ok')) {
    manager.quit();
    throw new Error(util.inspect(readyChecks));
  }

  return manager as DatabaseManagerInstance<T>;
}

export async function CreateStorageManager<T extends ManagerConfig>(
  requiredStorages: Array<Database | Cache>,
  requireAuth = false,
): Promise<{ db: DatabaseManagerInstance<T>; config: ManagerConfig }> {
  let config: ManagerConfig = {};

  for (const currentStorage of requiredStorages) {
    if (config[currentStorage]) {
      throw Error(`${currentStorage} was already defined.`);
    }
    if (currentStorage === Cache.DISTRIBUTED) {
      config = { ...config, ...validateRedisConfig(requireAuth) };
    } else if (currentStorage === Cache.LOCAL) {
      config = { ...config, ...validateLocalCacheConfig() };
    } else {
      config = { ...config, ...validateDatabaseConfig(requireAuth, currentStorage as Database) };
    }
  }

  if (!Object.values(config).every((value) => value === undefined)) {
    return { db: (await CreateDatabaseManager(config)) as DatabaseManagerInstance<T>, config };
  } else {
    throw Error('Configuration supplied to Database manager was not valid.');
  }
}

export type { ConfigurationDB, DatabaseManagerInstance, EvaluationDB, EventHistoryDB, ManagerConfig, RawHistoryDB };
