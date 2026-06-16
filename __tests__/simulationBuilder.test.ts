// SPDX-License-Identifier: Apache-2.0

import { simulationBuilder } from '../src/builders/simulationBuilder';
import type { SimulationDB } from '../src/interfaces/database/SimulationDB';
import type { DBConfig } from '../src/services/dbManager';
import { readyChecks } from '../src/services/dbManager';

// redis and postgres are mocked in setup.jest.js

const simulationConfig: DBConfig = {
  certPath: 'TestSimulation',
  databaseName: 'TestSimulation',
  user: 'TestSimulation',
  password: 'TestSimulation',
  host: 'TestSimulation',
  port: 5432,
};

describe('SimulationBuilder', () => {
  let manager: SimulationDB;

  beforeEach(async () => {
    jest.clearAllMocks();
    manager = {} as SimulationDB;
  });

  afterEach(() => {
    if (manager._simulation) {
      manager._simulation.end();
    }
  });

  describe('getSimulationMessages', () => {
    beforeEach(async () => {
      await simulationBuilder(manager, simulationConfig);
    });

    it('should set SimulationDB ready check to Ok on successful init', () => {
      expect(readyChecks.SimulationDB).toBe('Ok');
    });

    it('should query simulation messages for a tenant with default limit and offset', async () => {
      const tenantId = 'test-tenant';
      const mockRows = [{ messageId: 'msg-1', timestamp: '2024-01-01T00:00:00Z', endpoint: '/api/test', data: { key: 'value' } }];
      jest.spyOn(manager._simulation, 'query').mockResolvedValue({ rows: mockRows } as never);

      const result = await manager.getSimulationMessages(tenantId);

      expect(manager._simulation.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('SELECT'),
          values: [tenantId, 1000, 0],
        }),
      );
      expect(result).toEqual(mockRows);
    });

    it('should respect custom limit and offset', async () => {
      jest.spyOn(manager._simulation, 'query').mockResolvedValue({ rows: [] } as never);

      await manager.getSimulationMessages('tenant-id', 50, 100);

      expect(manager._simulation.query).toHaveBeenCalledWith(
        expect.objectContaining({
          values: ['tenant-id', 50, 100],
        }),
      );
    });

    it('should return an empty array when no messages exist', async () => {
      jest.spyOn(manager._simulation, 'query').mockResolvedValue({ rows: [] } as never);

      const result = await manager.getSimulationMessages('empty-tenant');

      expect(result).toEqual([]);
    });
  });
});
