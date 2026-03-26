// SPDX-License-Identifier: Apache-2.0

import type { ConfigurationDB } from './interfaces/database/ConfigurationDB';
import type { EnrichmentDB } from './interfaces/database/EnrichmentDB';
import type { EventHistoryDB } from './interfaces/database/EventHistoryDB';
import type { PgQueryConfig } from './builders/utils';
import { validateTableName } from './builders/utils';
import type { EvaluationDB } from './interfaces/database/EvaluationDB';
import type { RawHistoryDB } from './interfaces/database/RawHistoryDB';
import { CreateDatabaseManager, type DatabaseManagerInstance, type ManagerConfig } from './services/dbManager';
import { LoggerService } from './services/logger';
import { RedisService } from './services/redis';
import { createSafeObjectFromEndpoint } from './helpers/safeObjectFromSchema';

export {
  CreateDatabaseManager,
  LoggerService,
  RedisService,
  createSafeObjectFromEndpoint,
  validateTableName,
  type ConfigurationDB,
  type DatabaseManagerInstance,
  type ManagerConfig,
  type PgQueryConfig,
  type EnrichmentDB,
  type EventHistoryDB,
  type EvaluationDB,
  type RawHistoryDB,
};

export type * from './interfaces';
