// SPDX-License-Identifier: Apache-2.0

import type NodeCache from 'node-cache';
import type { Pool } from 'pg';
import type { NetworkMap, RuleConfig } from '..';
import type { TypologyConfig } from '../processor-files/TypologyConfig';

export interface ConfigurationDB {
  _configuration: Pool;
  nodeCache?: NodeCache;

  /**
   * @param {string} ruleId A ruleId String used to filter on the id field
   * @param {string} cfg A cfg String used to filter on the cfg field
   * @param {string} tenantId A tenantId string for filtering by tenantId field
   * @returns {RuleConfig} rule config
   *
   * @memberof ConfigurationDB
   */
  getRuleConfig: (ruleId: string, cfg: string, tenantId: string) => Promise<RuleConfig | undefined>;

  /**
   * @param {string} typologyId typology identifier
   * @param {string} typologyCfg typology configuration version
   * @param {string} tenantId tenant identifier
   * @returns {TypologyConfig} given typology's config
   *
   * @memberof ConfigurationDB
   */
  getTypologyConfig: (typologyId: string, typologyCfg: string, tenantId: string) => Promise<TypologyConfig | undefined>;

  /**
   * Reads active network maps. Not cached: callers own caching, because
   * `network-map.activated` service-channel events must be able to evict it.
   *
   * - Without `tenantId`: every tenant's active map (deliberate cross-tenant read,
   *   e.g. startup route discovery).
   * - With `tenantId`: only that tenant's active map - `[]` or `[map]`, since at most
   *   one map per tenant can be active. An empty string is treated as a tenant id.
   *
   * Callers must match results on `map.tenantId` and never assume `result[0]` belongs
   * to the requested tenant: a tenant id that is `undefined` at runtime falls back to
   * the cross-tenant read.
   *
   * @param {string} [tenantId] tenant identifier to scope the read to
   * @returns {NetworkMap[]} active networkmaps
   *
   * @memberof ConfigurationDB
   */
  getNetworkMap: (tenantId?: string) => Promise<NetworkMap[]>;

  /**
   * @param {string} path path to filter on
   * @param {string} tenantId tenant identifier
   * @returns {Promise<Record<string, unknown> | undefined>}
   *
   * @memberof ConfigurationDB
   */
  getPathPushJob: (path: string, tenantId: string) => Promise<Record<string, unknown> | undefined>;

  /**
   * @returns {Promise<Record<string, unknown> | undefined>} default push job with active publishing status
   *
   * @memberof ConfigurationDB
   */
  getDefaultPushJob: () => Promise<Array<Record<string, unknown>>>;

  /**
   * @param {'push' | 'pull'} type job type (push or pull)
   * @param {string} id job identifier
   * @returns {Promise<Record<string, unknown> | undefined>}
   *
   * @memberof ConfigurationDB
   */
  getJobId: (type: 'push' | 'pull', id: string, tenantId: string) => Promise<Record<string, unknown> | undefined>;

  /**
   * @param {string} tenantId tenant identifier
   * @param {string} jobId job identifier
   * @param {number} counts total counts
   * @param {number} processedCounts processed counts
   * @param {string} exception exception details
   * @param {string} jobType job type
   * @returns {Promise<void>}
   *
   * @memberof ConfigurationDB
   */
  insertJobHistory: (
    tenantId: string,
    jobId: string,
    counts: number,
    processedCounts: number,
    exception: string | null,
    jobType: string,
  ) => Promise<void>;
}
