import { aql } from 'arangojs';
import { type GeneratedAqlQuery } from 'arangojs/aql';
import {
  CreateDatabaseManager,
  type DatabaseManagerInstance,
  type ManagerConfig,
} from './services/dbManager';
import { type ConfigurationDB } from './interfaces/database/ConfigurationDB';
import { type TransactionHistoryDB } from './interfaces/database/TransactionHistoryDB';
import { type PseudonymsDB } from './interfaces/database/PseudonymsDB';
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
