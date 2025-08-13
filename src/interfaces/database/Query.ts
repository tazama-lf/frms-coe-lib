import type { QueryConfig } from 'pg';

/**
 *  Based on Postgres QueryConfig to assist with postgres's query(queryConfig: PgQueryConfig)
 *
 * @interface
 */
export interface PgQueryConfig extends QueryConfig {
  text: string;
  values: unknown[];
}
