// SPDX-License-Identifier: Apache-2.0

// Use mock redis instead of actual in jest
jest.mock('ioredis', () => jest.requireActual('ioredis-mock'));

// Use mock arango instead of actual in jest
const arangojs = jest.requireActual('arangojs');

class MockDatabase {
  collection(col) {
    return {
      save: () => {
        return 'MOCK-SAVE';
      },
      update: () => {
        return 'MOCK-UPDATE';
      },
      document: () => {
        return { tenantId: 'tenantId' };
      },
    };
  }

  query(query) {
    return query;
  }

  save(data, options) {
    return data;
  }

  update(selector, newdata, options) {
    return newdata;
  }

  close() {
    return undefined;
  }

  isArangoDatabase() {
    return true;
  }

  exists() {
    return true;
  }
}

const mockArangojs = { ...arangojs, Database: MockDatabase };

jest.mock('arangojs', () => mockArangojs);
