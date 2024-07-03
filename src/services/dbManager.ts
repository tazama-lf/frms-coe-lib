// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */

import { type RedisService } from '..';
import { type RedisConfig } from '../interfaces';
import { type PseudonymsDB } from '../interfaces/database/PseudonymsDB';
import { type TransactionHistoryDB } from '../interfaces/database/TransactionHistoryDB';
import { type ConfigurationDB } from '../interfaces/database/ConfigurationDB';
import { redisBuilder } from '../builders/redisBuilder';
import { pseudonymsBuilder } from '../builders/pseudonymsBuilder';
import { transactionHistoryBuilder } from '../builders/transactionHistoryBuilder';
import { configurationBuilder } from '../builders/configurationBuilder';
import { type TransactionDB } from '../interfaces/database/TransactionDB';
import { transactionBuilder } from '../builders/transactionBuilder';

export let readyChecks: Record<string, unknown> = {};

export interface DBConfig {
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
  transaction?: DBConfig;
  configuration?: DBConfig;
  redisConfig?: RedisConfig;
}

interface ManagerStatus {
  /**
   * Returns the status of all services where config was provided.
   *
   * @returns {string | Error} Key-value pair of service and their status
   */
  isReadyCheck: () => any;
}

export type DatabaseManagerType = Partial<
  ManagerStatus & PseudonymsDB & TransactionHistoryDB & TransactionDB & ConfigurationDB & RedisService
>;

type DatabaseManagerInstance<T extends ManagerConfig> = ManagerStatus &
  (T extends { pseudonyms: DBConfig } ? PseudonymsDB : Record<string, any>) &
  (T extends { transactionHistory: DBConfig } ? TransactionHistoryDB : Record<string, any>) &
  (T extends { transaction: DBConfig } ? TransactionDB : Record<string, any>) &
  (T extends { configuration: DBConfig } ? ConfigurationDB : Record<string, any>) &
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

  if (config.transaction) {
    await transactionBuilder(manager, config.transaction, redis !== null);
  }

  if (config.configuration) {
    await configurationBuilder(manager, config.configuration);
  }

  manager.isReadyCheck = () => readyChecks;

  manager.quit = () => {
    redis?.quit();
    manager._pseudonymsDb?.close();
    manager._transactionHistory?.close();
    manager._configuration?.close();
    manager._transaction?.close();
  };

  if (Object.values(readyChecks).some((status) => status !== 'Ok')) {
    manager.quit();
    throw new Error(JSON.stringify(readyChecks));
  }

  return manager as DatabaseManagerInstance<T>;
}

export type { ManagerConfig, TransactionHistoryDB, TransactionDB, ConfigurationDB, PseudonymsDB, DatabaseManagerInstance };
