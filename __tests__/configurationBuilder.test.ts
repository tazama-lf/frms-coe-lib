// SPDX-License-Identifier: Apache-2.0

import { configurationBuilder } from '../src/builders/configurationBuilder';
import type { ConfigurationDB, DBConfig } from '../src/services/dbManager';

// redis and postgres are mocked in setup.jest.js

const configurationConfig: DBConfig = {
  certPath: 'TestConfiguration',
  databaseName: 'TestConfiguration',
  user: 'TestConfiguration',
  password: 'TestConfiguration',
  host: 'TestConfiguration',
  port: 5432,
};

describe('ConfigurationBuilder', () => {
  let manager: ConfigurationDB;

  beforeEach(async () => {
    jest.clearAllMocks();
    manager = {} as ConfigurationDB;
  });

  afterEach(() => {
    if (manager._configuration) {
      manager._configuration.end();
    }
  });

  describe('getPathPushJob', () => {
    beforeEach(async () => {
      await configurationBuilder(manager, configurationConfig);
    });

    it('should return the first row when rows exist', async () => {
      const mockRow = { id: '1', path: '/test', tenant_id: 'tenant1' };
      const mockQuery = jest.spyOn(manager._configuration, 'query').mockResolvedValue({ rows: [mockRow] } as never);

      const result = await manager.getPathPushJob('/test', 'tenant1');

      expect(result).toEqual(mockRow);
      expect(mockQuery).toHaveBeenCalledWith({
        text: 'SELECT * FROM tcs_push_jobs WHERE path = $1 AND tenant_id = $2 LIMIT 1;',
        values: ['/test', 'tenant1'],
      });
    });

    it('should return undefined when no rows exist', async () => {
      jest.spyOn(manager._configuration, 'query').mockResolvedValue({ rows: [] } as never);

      const result = await manager.getPathPushJob('/nonexistent', 'tenant1');

      expect(result).toBeUndefined();
    });
  });

  describe('getDefaultPushJob', () => {
    beforeEach(async () => {
      await configurationBuilder(manager, configurationConfig);
    });

    it('should return all rows', async () => {
      const mockRows = [
        { id: '1', status: 'STATUS_08_DEPLOYED' },
        { id: '2', status: 'STATUS_06_EXPORTED' },
      ];
      const mockQuery = jest.spyOn(manager._configuration, 'query').mockResolvedValue({ rows: mockRows } as never);

      const result = await manager.getDefaultPushJob();

      expect(result).toEqual(mockRows);
      expect(mockQuery).toHaveBeenCalledWith({
        text: expect.stringContaining('STATUS_08_DEPLOYED'),
        values: [],
      });
    });

    it('should return empty array when no rows exist', async () => {
      jest.spyOn(manager._configuration, 'query').mockResolvedValue({ rows: [] } as never);

      const result = await manager.getDefaultPushJob();

      expect(result).toEqual([]);
    });
  });

  describe('getIdPushJob', () => {
    beforeEach(async () => {
      await configurationBuilder(manager, configurationConfig);
    });

    it('should query tcs_push_jobs when type is "push" and return first row', async () => {
      const mockRow = { id: 'push-1', name: 'test-push-job' };
      const mockQuery = jest.spyOn(manager._configuration, 'query').mockResolvedValue({ rows: [mockRow] } as never);

      const result = await manager.getIdPushJob('push', 'push-1');

      expect(result).toEqual(mockRow);
      const calledQuery = mockQuery.mock.calls[0][0] as unknown as { text: string; values: string[] };
      expect(calledQuery.text).toContain('tcs_push_jobs');
      expect(calledQuery.values).toEqual(['push-1']);
    });

    it('should query tcs_pull_jobs when type is "pull" and return first row', async () => {
      const mockRow = { id: 'pull-1', name: 'test-pull-job', cron: '* * * * *' };
      const mockQuery = jest.spyOn(manager._configuration, 'query').mockResolvedValue({ rows: [mockRow] } as never);

      const result = await manager.getIdPushJob('pull', 'pull-1');

      expect(result).toEqual(mockRow);
      const calledQuery = mockQuery.mock.calls[0][0] as unknown as { text: string; values: string[] };
      expect(calledQuery.text).toContain('tcs_pull_jobs');
      expect(calledQuery.text).toContain('tcs_cron_jobs');
      expect(calledQuery.values).toEqual(['pull-1']);
    });

    it('should return undefined when no rows exist for push type', async () => {
      jest.spyOn(manager._configuration, 'query').mockResolvedValue({ rows: [] } as never);

      const result = await manager.getIdPushJob('push', 'nonexistent');

      expect(result).toBeUndefined();
    });

    it('should return undefined when no rows exist for pull type', async () => {
      jest.spyOn(manager._configuration, 'query').mockResolvedValue({ rows: [] } as never);

      const result = await manager.getIdPushJob('pull', 'nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('insertJobHistory', () => {
    beforeEach(async () => {
      await configurationBuilder(manager, configurationConfig);
    });

    it('should insert a job history record', async () => {
      const mockQuery = jest.spyOn(manager._configuration, 'query').mockResolvedValue({} as never);

      await manager.insertJobHistory('tenant1', 'job1', 10, 5, null, 'push');

      expect(mockQuery).toHaveBeenCalledWith({
        text: 'INSERT INTO job_history (tenant_id, job_id, counts, processed_counts, exception, job_type) VALUES ($1, $2, $3, $4, $5, $6);',
        values: ['tenant1', 'job1', 10, 5, null, 'push'],
      });
    });

    it('should insert a job history record with exception', async () => {
      const mockQuery = jest.spyOn(manager._configuration, 'query').mockResolvedValue({} as never);

      await manager.insertJobHistory('tenant1', 'job2', 20, 15, 'Something failed', 'pull');

      expect(mockQuery).toHaveBeenCalledWith({
        text: expect.stringContaining('INSERT INTO job_history'),
        values: ['tenant1', 'job2', 20, 15, 'Something failed', 'pull'],
      });
    });

    it('should propagate query errors', async () => {
      const mockError = new Error('Query execution failed');
      jest.spyOn(manager._configuration, 'query').mockRejectedValue(mockError as never);

      await expect(manager.insertJobHistory('tenant1', 'job1', 10, 5, null, 'push')).rejects.toThrow('Query execution failed');
    });
  });
});
