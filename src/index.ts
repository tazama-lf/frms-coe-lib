import { aql } from 'arangojs';
import { type GeneratedAqlQuery } from 'arangojs/aql';
import {
  CreateDatabaseManager,
  type ConfigurationDB,
  type DatabaseManagerInstance,
  type ManagerConfig,
  type PseudonymsDB,
  type TransactionHistoryDB,
} from './services/dbManager';
import { LoggerService } from './services/logger';
import { RedisService } from './services/redis';

export {
  CreateDatabaseManager,
  LoggerService,
  RedisService,
  aql,
  type ConfigurationDB,
  type DatabaseManagerInstance,
  type GeneratedAqlQuery,
  type ManagerConfig,
  type PseudonymsDB,
  type TransactionHistoryDB,
};
