// SPDX-License-Identifier: Apache-2.0

import type { ConfigurationDB } from './interfaces/database/ConfigurationDB';
import type { EventHistoryDB } from './interfaces/database/EventHistoryDB';
import type { PgQueryConfig } from './builders/utils';
import { validateTableName } from './builders/utils';
import type { EvaluationDB } from './interfaces/database/EvaluationDB';
import type { RawHistoryDB } from './interfaces/database/RawHistoryDB';
import {
  CreateDatabaseManager,
  CreateStorageManager,
  type DatabaseManagerHooks,
  type DatabaseManagerInstance,
  type ManagerConfig,
} from './services/dbManager';
import { LoggerService } from './services/logger';
import { RedisService } from './services/redis';
import type { EnrichmentDB } from './interfaces/database/EnrichmentDB';
import { createSafeObjectFromEndpoint } from './helpers/safeObjectFromSchema';
import {
  isBaseMessageTransaction,
  isPacs002Transaction,
  isStructuredTransaction,
  isPacs008Transaction,
  isPain001Transaction,
  isPain013Transaction,
} from './helpers/transactionTypeGuards';

export {
  CreateDatabaseManager,
  CreateStorageManager,
  LoggerService,
  RedisService,
  createSafeObjectFromEndpoint,
  isPacs002Transaction,
  isBaseMessageTransaction,
  isStructuredTransaction,
  isPacs008Transaction,
  isPain001Transaction,
  isPain013Transaction,
  validateTableName,
  type ConfigurationDB,
  type DatabaseManagerHooks,
  type DatabaseManagerInstance,
  type ManagerConfig,
  type PgQueryConfig,
  type EventHistoryDB,
  type EvaluationDB,
  type RawHistoryDB,
  type EnrichmentDB,
};

export type * from './interfaces';
export {
  OutcomeResultSchema,
  BandSchema,
  ExpressionSchema,
  CaseSchema,
  TimeframeSchema,
  baseConfigSchema,
  baseRuleConfigSchema,
} from './schemas/ruleConfig';
