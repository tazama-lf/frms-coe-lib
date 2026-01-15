// SPDX-License-Identifier: Apache-2.0

import { AuditLogger } from '../src/services/auditLog.service';
// Mock OpenSearch config to avoid env validation during service construction
jest.mock('../src/config/openSearch.config', () => ({
  openSearchConfig: () => ({
    node: 'http://localhost:9200',
    auth: { username: 'test-user', password: 'test-pass' },
    ssl: { rejectUnauthorized: false },
    indexPrefix: 'audit-logs-test',
  }),
}));

describe('AuditLogger', () => {
  let logger: AuditLogger;
  let mockIndex: jest.Mock;
  let mockExistsTemplate: jest.Mock;
  let mockPutTemplate: jest.Mock;

  beforeEach(async () => {
    (AuditLogger as any).instance = undefined;
    logger = AuditLogger.getInstance();

    mockIndex = jest.fn().mockResolvedValue({ body: { result: 'created' } });
    mockExistsTemplate = jest.fn().mockResolvedValue({ statusCode: 404 });
    mockPutTemplate = jest.fn().mockResolvedValue({ body: { acknowledged: true } });

    const mockClient = {
      index: mockIndex,
      indices: {
        existsTemplate: mockExistsTemplate,
        putTemplate: mockPutTemplate,
      },
    };

    (logger as any).client = mockClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('init()', () => {
    it('should create schema if it does not exist', async () => {
      await logger.init('test-service');

      // FIX: Changed 'v2' to match the actual code
      expect(mockExistsTemplate).toHaveBeenCalledWith({
        name: 'audit-logs-template',
      });
      expect(mockPutTemplate).toHaveBeenCalled();
    });

    it('should NOT create schema if it already exists', async () => {
      mockExistsTemplate.mockResolvedValueOnce({ statusCode: 200 });
      await logger.init('test-service');
      expect(mockExistsTemplate).toHaveBeenCalled();
      expect(mockPutTemplate).not.toHaveBeenCalled();
    });
  });

  describe('log()', () => {
    it('should send correct data to OpenSearch', async () => {
      await logger.init('TestService');

      await logger.log({
        actorId: 'user-123',
        eventType: 'LOGIN',
        status: 'success',
        description: 'User logged in',
        sourceIp: '127.0.0.1',
        actorRole: 'Admin',
        actorName: 'John Doe',
        actorEmail: 'john.doe@example.com',
        resourceId: 'account-55',
        resourceType: 'UserAccount',
        outcome: { extra: 'data' },
        actionPerformed: { performed: 'action' },
        tenantId: 'tenant-1',
      });

      expect(mockIndex).toHaveBeenCalledTimes(1);

      const callArgs = mockIndex.mock.calls[0][0];

      expect(callArgs).toMatchObject({
        refresh: 'wait_for',
        body: {
          actorId: 'user-123',
          eventType: 'LOGIN',
          status: 'success',
          description: 'User logged in',
          sourceIp: '127.0.0.1',
          actorRole: 'Admin',
          actorName: 'John Doe',
          actorEmail: 'john.doe@example.com',
          resourceId: 'account-55',
          resourceType: 'UserAccount',
          outcome: { extra: 'data' },
          actionPerformed: { performed: 'action' },
          tenantId: 'tenant-1',
        },
      });
    });

    it('should throw error if OpenSearch fails', async () => {
      // 2. Force Failure
      mockIndex.mockRejectedValueOnce(new Error('Connection Refused'));

      // 3. Run Test
      await expect(
        logger.log({
          actorId: '1',
          eventType: 'FAIL',
          status: 'failure',
          description: 'test',
        } as any),
      ).rejects.toThrow('Audit Log Failed: Transaction Aborted.');
    });
  });
});
