import { type Database } from 'arangojs';
import type NodeCache from 'node-cache';
import { type DBConfig } from '../../services/dbManager';
import { type Typology } from '..';

export interface ConfigurationDB {
  _configuration: Database;
  setupConfig: DBConfig;
  nodeCache: NodeCache;

  /**
   * @param collection: Collection name against which this query will be run
   * @param filter: String that will put next to the FILTER keyword to run against Arango
   *
   * This is what the query looks like internally:
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER ${filter}F
   * RETURN doc`;
   * ```
   *
   * Note, use "doc." in your query string, as we make use of "doc" as the query and return name.
   * @memberof ConfigurationDB
   */
  queryConfigurationDB: (collection: string, filter: string, limit?: number) => Promise<unknown>;

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
  getRuleConfig: (ruleId: string, cfg: string, limit?: number) => Promise<unknown>;

  /**
   * Returns transaction configuration
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * RETURN doc`
   * ```
   * @memberof ConfigurationDB
   */
  getTransactionConfig: (transactionId: string, cfg: string) => Promise<unknown>;

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
  getTypologyExpression: (typology: Typology) => Promise<unknown>;
}
