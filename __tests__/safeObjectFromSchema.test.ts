// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, jest } from '@jest/globals';
import { createSafeObjectFromEndpoint } from '../src/helpers/safeObjectFromSchema';

describe('createSafeObjectFromEndpoint', () => {
  const endpointPath = '/cbe/v1/fable003';

  const schemaBundle = {
    publishing_status: 'active',
    schema: {
      type: 'object',
      properties: {
        storyamount: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            cnic: { type: 'string' },
            nestedFlag: { type: 'boolean' },
          },
        },
      },
    },
  };

  const payload = {
    storyamount: {
      amount: 1000,
      cnic: 1234,
      nestedFlag: 'true',
    },
  };

  it('reads nested values with dot notation and type coercion', async () => {
    const redisService = {
      getEndpointSchemaBundle: jest.fn(async () => schemaBundle),
    };

    const safeObject = await createSafeObjectFromEndpoint(endpointPath, payload, { redisService });

    expect(safeObject.storyamount.amount).toBe(1000);
    expect(typeof safeObject.storyamount.amount).toBe('number');
    expect(safeObject.storyamount.cnic).toBe('1234');
    expect(typeof safeObject.storyamount.cnic).toBe('string');
    expect(safeObject.storyamount.nestedFlag).toBe(true);
  });

  it('throws when path does not exist in schema', async () => {
    const redisService = {
      getEndpointSchemaBundle: jest.fn(async () => schemaBundle),
    };

    const safeObject = await createSafeObjectFromEndpoint(endpointPath, payload, { redisService });

    expect(() => safeObject.storyamount.country).toThrow("Path 'storyamount.country' does not exist in configured schema");
  });

  it('throws when payload type does not match schema and cannot be coerced', async () => {
    const redisService = {
      getEndpointSchemaBundle: jest.fn(async () => schemaBundle),
    };

    const mismatchedPayload = {
      storyamount: {
        amount: 'not-a-number',
      },
    };

    const safeObject = await createSafeObjectFromEndpoint(endpointPath, mismatchedPayload, { redisService });

    expect(() => safeObject.storyamount.amount).toThrow("Expected number but received 'string'");
  });

  it('throws when schema is inactive', async () => {
    const redisService = {
      getEndpointSchemaBundle: jest.fn(async () => ({ ...schemaBundle, publishing_status: 'draft' })),
    };

    await expect(createSafeObjectFromEndpoint(endpointPath, payload, { redisService })).rejects.toThrow(
      "Schema for endpointPath '/cbe/v1/fable003' is not active",
    );
  });
});
