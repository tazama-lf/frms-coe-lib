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
  /** Read-only pool — present only when readonly credentials are configured. */
  _simulationReadonly?: Pool;

  /**
   * Retrieve all simulation messages for a given tenant
   * @param tenantId The tenant identifier to filter messages
   * @param limit Maximum number of messages to return (default 1000)
   * @param offset Number of messages to skip (default 0)
   * @memberof SimulationDB
   */
  getSimulationMessages: (tenantId: string, limit?: number, offset?: number) => Promise<SimulationMessage[]>;
}
