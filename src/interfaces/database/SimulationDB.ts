// SPDX-License-Identifier: Apache-2.0

import type { Pool } from 'pg';

export interface SimulationMessage {
  messageId: string;
  timestamp: string;
  endpoint: string;
  data: Record<string, unknown>;
}

export interface SimulationDB {
  _simulation: Pool;

  /**
   * Retrieve all simulation messages for a given tenant
   * @param tenantId The tenant identifier to filter messages
   * @memberof SimulationDB
   */
  getSimulationMessages: (tenantId: string) => Promise<SimulationMessage[]>;
}
