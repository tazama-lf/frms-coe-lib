// SPDX-License-Identifier: Apache-2.0

import type { Pool } from 'pg';

export interface EnrichmentDB {
  _enrichment: Pool;

  /**
   * Execute a custom query on the enrichment database
   * @param text SQL query text
   * @param values Query parameters
   * @memberof EnrichmentDB
   */
  ingestData: (text: string, values?: unknown[]) => Promise<void>;

  /**
   * Create a new table in the enrichment database
   * @param tableName Name of the table to create (must match pattern: /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/)
   * @throws {Error} If tableName contains invalid characters or exceeds length limit
   * @memberof EnrichmentDB
   */
  createTable: (tableName: string) => Promise<void>;

  /**
   * Delete all rows from a table
   * @param tableName Name of the table to delete rows from (must match pattern: /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/)
   * @throws {Error} If tableName contains invalid characters or exceeds length limit
   * @memberof EnrichmentDB
   */
  deleteRows: (tableName: string) => Promise<void>;
}
