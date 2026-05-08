// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';

const endpointPath = '/cbe/v1/fable003';
const payload = {
  storyamount: {
    amount: 1000,
  },
};

const schemaBundle = {
  publishing_status: 'active',
  schema: {
    type: 'object',
    properties: {
      storyamount: {
        type: 'object',
        properties: {
          amount: { type: 'number' },
        },
      },
    },
  },
};

const originalEnv = { ...process.env };

describe('createSafeObjectFromEndpoint redis bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.dontMock('../src/config/redis.config');
    jest.dontMock('../src/services/redis');
  });

  it('falls back to EMS-style redis env vars when coe-lib redis validation fails', async () => {
    process.env.REDIS_HOST = '127.0.0.1';
    process.env.REDIS_PORT = '6379';
    process.env.REDIS_PASSWORD = 'secret';
    process.env.REDIS_DB = '5';
    process.env.REDIS_IS_CLUSTER = 'false';

    const createMock = jest.fn(async (_config: unknown) => ({
      getJson: async () => JSON.stringify(schemaBundle),
    }));

    jest.doMock('../src/config/redis.config', () => ({
      validateRedisConfig: jest.fn(() => {
        throw new Error('Environment variable REDIS_SERVERS is not defined.');
      }),
    }));

    jest.doMock('../src/services/redis', () => ({
      RedisService: {
        create: createMock,
      },
    }));

    const { createSafeObjectFromEndpoint } = await import('../src/helpers/safeObjectFromSchema');

    const safeObject = await createSafeObjectFromEndpoint(endpointPath, payload);

    expect(safeObject.storyamount.amount).toBe(1000);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      db: 5,
      servers: [{ host: '127.0.0.1', port: 6379 }],
      password: 'secret',
      isCluster: false,
    });
  });

  it('preserves distributed cache guard when coe-lib redis config is explicitly disabled', async () => {
    process.env.REDIS_HOST = '127.0.0.1';
    process.env.REDIS_PORT = '6379';
    process.env.REDIS_PASSWORD = 'secret';

    const createMock = jest.fn(async (_config: unknown) => ({
      getJson: async () => JSON.stringify(schemaBundle),
    }));

    jest.doMock('../src/config/redis.config', () => ({
      validateRedisConfig: jest.fn(() => ({
        redisConfig: {
          db: 0,
          servers: [{ host: 'localhost', port: 6379 }],
          password: 'pw',
          isCluster: false,
          distributedCacheEnabled: false,
        },
      })),
    }));

    jest.doMock('../src/services/redis', () => ({
      RedisService: {
        create: createMock,
      },
    }));

    const { createSafeObjectFromEndpoint } = await import('../src/helpers/safeObjectFromSchema');

    await expect(createSafeObjectFromEndpoint(endpointPath, payload)).rejects.toThrow(
      'Distributed Redis cache is not enabled for schema lookups',
    );

    expect(createMock).not.toHaveBeenCalled();
  });
});
