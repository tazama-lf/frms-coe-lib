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
   * @returns {NetworkMap[]} active networkmaps
   *
   * @memberof ConfigurationDB
   */
  getNetworkMap: () => Promise<NetworkMap[]>;
}
