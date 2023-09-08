import { type Database } from 'arangojs';

export async function isDatabaseReady(db: Database | undefined): Promise<boolean> {
  if (db?.name === '_system' || !db?.isArangoDatabase || !(await db.exists())) {
    return false;
  }
  return true;
}
