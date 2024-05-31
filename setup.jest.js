// SPDX-License-Identifier: Apache-2.0

/* eslint-disable */

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
    };
  }

  query(query) {
    return query;
  }

  save(data, options) {
    return data;
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
