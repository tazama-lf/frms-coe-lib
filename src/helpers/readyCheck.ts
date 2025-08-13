// SPDX-License-Identifier: Apache-2.0

import type { Pool } from 'pg';

export async function isDatabaseReady(db: Pool): Promise<boolean> {
  const client = await db.connect();
  await client.query('SELECT 1');
  client.release();
  return true;
}
