// SPDX-License-Identifier: Apache-2.0

import type { Pool } from 'pg';

export interface EnrichmentDB {
  _enrichment: Pool;

  /**
   * Save enrichment data to the database
   * @param id Unique identifier for the enrichment record
   * @param data Enrichment data payload
   * @memberof EnrichmentDB
   */
  saveEnrichmentData: (id: string, data: Record<string, unknown>) => Promise<void>;

  /**
   * Retrieve enrichment data by identifier
   * @param id Unique identifier for the enrichment record
   * @memberof EnrichmentDB
   */
  getEnrichmentData: (id: string) => Promise<Record<string, unknown> | undefined>;

  /**
   * Execute a custom query on the enrichment database
   * @param text SQL query text
   * @param values Query parameters
   * @memberof EnrichmentDB
   */
  ingestData: (text: string, values?: unknown[]) => Promise<void>;

  /**
   * Create a new table in the enrichment database
   * @param tableName Name of the table to create
   * @memberof EnrichmentDB
   */
  createTable: (tableName: string) => Promise<void>;

  /**
   * Delete all rows from a table
   * @param tableName Name of the table to delete rows from
   * @memberof EnrichmentDB
   */
  deleteRows: (tableName: string) => Promise<void>;
}
