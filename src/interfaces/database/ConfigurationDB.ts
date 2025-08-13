// SPDX-License-Identifier: Apache-2.0

import type NodeCache from 'node-cache';
import type { Pool } from 'pg';
import type { NetworkMap, RuleConfig, Typology } from '..';
import type { TypologyConfig } from '../processor-files/TypologyConfig';

export interface ConfigurationDB {
  _configuration: Pool;
  nodeCache?: NodeCache;

  /**
   * Returns rule config
   * @param ruleId A ruleId String used to filter on the id field
   * @param cfg A cfg String used to filter on the cfg field
   * @param limit A limit Number used to limit the amount of results
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.id == ${ruleId}
   * FILTER doc.cfg == ${cfg}
   * *LIMIT ${limit}
   * RETURN doc`
   * ```
   * \* Indicates filter is only applied when parameter is passed in
   * @memberof ConfigurationDB
   */
  getRuleConfig: (ruleId: string, cfg: string, limit?: number) => Promise<RuleConfig | undefined>;

  /**
   * Returns typology expression
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.id == ${typology.id} AND doc.cfg == ${typology.cfg}
   * RETURN doc`;
   * ```
   * @memberof ConfigurationDB
   */
  getTypologyConfig: (typology: Typology) => Promise<TypologyConfig | undefined>;

  /**
   * Finds all active networkmaps
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.active == true
   * RETURN doc
   * ```
   *
   * @memberof ConfigurationDB
   */
  getNetworkMap: () => Promise<NetworkMap[]>;
}
