// SPDX-License-Identifier: Apache-2.0

import * as util from 'node:util';
import { Pool, type PoolConfig } from 'pg';
import { isDatabaseReady } from '../builders/utils';
import type { PgQueryConfig } from '../interfaces/database';
import type { SimulationDB, SimulationMessage } from '../interfaces/database/SimulationDB';
import { type DBConfig, readyChecks } from '../services/dbManager';
import { getSSLConfig } from './utils';

export async function simulationBuilder(manager: SimulationDB, simulationConfig: DBConfig): Promise<void> {
  const conf: PoolConfig = {
    host: simulationConfig.host,
    port: simulationConfig.port,
    database: simulationConfig.databaseName,
    user: simulationConfig.user,
    password: simulationConfig.password,
    ssl: getSSLConfig(simulationConfig.certPath),
  } as const;

  manager._simulation = new Pool(conf);

  try {
    const dbReady = await isDatabaseReady(manager._simulation);
    readyChecks.SimulationDB = dbReady ? 'Ok' : 'err';
  } catch (error) {
    const err = error as Error;
    readyChecks.SimulationDB = `err, ${util.inspect(err)}`;
  }

  manager.getSimulationMessages = async (tenantId: string, limit = 1000, offset = 0): Promise<SimulationMessage[]> => {
    const query: PgQueryConfig = {
      text: 'SELECT message_id AS "messageId", timestamp, endpoint, data FROM simulation_message WHERE tenant_id = $1 ORDER BY timestamp ASC LIMIT $2 OFFSET $3',
      values: [tenantId, limit, offset],
    };

    const queryRes = await manager._simulation.query<SimulationMessage>(query);
    return queryRes.rows;
  };
}
