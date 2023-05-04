/* eslint-disable no-undef */

// Use mock redis instead of actual in jest
jest.mock("ioredis", () => jest.requireActual("ioredis-mock"));

// Use mock arango instead of actual in jest
const arangojs = jest.requireActual("arangojs");

class MockDatabase {
  constructor(config) {}
  collection(col) {
    return {
        save: () => { return "MOCK-SAVE" }
    }
  }
  query(query) {
    return query;
  }
  query(query, queryOptions) {
    return query;
  }
  save(data, options) {
    return data;
  }
  close() {}
}

const mockArangojs = { ...arangojs, Database: MockDatabase };

jest.mock("arangojs", () => mockArangojs);
