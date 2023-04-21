// SPDX-License-Identifier: Apache-2.0

// Use mock redis instead of actual in jest
jest.mock('ioredis', () => jest.requireActual('ioredis-mock'));

// Use mock postgres instead of actual in jest
const postgres = jest.requireActual('pg');

class MockPool {
  connect() {
    return {
      query: (query) => {
        return query;
      },
      release: () => {
        return true;
      },
      document: () => {
        return { tenantId: 'tenantId' };
      },
    };
  }

  query(query) {
    return query;
  }

  end() {
    return undefined;
  }
}

const mockPostgres = { ...postgres, Pool: MockPool };

jest.mock('pg', () => mockPostgres);