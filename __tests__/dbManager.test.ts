import { AqlLiteral, isAqlQuery } from "arangojs/aql";
import { ConfigurationDB, PseudonymsDB, RedisService, TransactionHistoryDB } from "../src";
import { TransactionRelationship } from "../src/interfaces";
import { CreateDatabaseManager, DatabaseManagerInstance, NetworkMapDB } from "../src/services/dbManager";

// redis and aragojs is mocked
// setup.jest.js

const redisConfig = {
  db: 0,
  host: "Test",
  password: "Test",
  port: 63792,
};

const transactionHistoryConfig = {
  certPath: "TestHistory",
  databaseName: "TestHistory",
  user: "TestHistory",
  password: "TestHistory",
  url: "TestHistory",
};

const configurationConfig = {
  certPath: "TestConfiguration",
  databaseName: "TestConfiguration",
  user: "TestConfiguration",
  password: "TestConfiguration",
  url: "TestConfiguration",
  localCacheEnabled: true,
  localCacheTTL: 10,
};

const pseudonymsConfig = {
  certPath: "TestPseudonym",
  databaseName: "TestPseudonym",
  user: "TestPseudonym",
  password: "TestPseudonym",
  url: "TestPseudonym",
};

const networkMapConfig = {
  certPath: "TestNetworkMap",
  databaseName: "TestNetworkMap",
  user: "TestNetworkMap",
  password: "TestNetworkMap",
  url: "TestNetworkMap",
};

const mockTR: TransactionRelationship = {
  CreDtTm: "MOCK-CreDtTm",
  EndToEndId: "MOCK-EndToEndId",
  from: "MOCK-from",
  MsgId: "MOCK-MsgId",
  PmtInfId: "MOCK-PmtInfId",
  to: "MOCK-to",
  TxTp: "MOCK-TxTp",
  Amt: "MOCK-Amt",
  Ccy: "MOCK-Ccy",
};
const config = {
  redisConfig: redisConfig,
  transactionHistory: transactionHistoryConfig,
  configuration: configurationConfig,
  pseudonyms: pseudonymsConfig,
  networkMap: networkMapConfig
};

let globalManager: DatabaseManagerInstance<typeof config>;

beforeAll(async () => {
  const config = {
    redisConfig: redisConfig,
    transactionHistory: transactionHistoryConfig,
    configuration: configurationConfig,
    pseudonyms: pseudonymsConfig,
    networkMap: networkMapConfig,
  };
  globalManager = await CreateDatabaseManager(config);
});

afterAll(() => {
  globalManager.quit();
});

describe("CreateDatabaseManager", () => {
  let transSpy: jest.SpyInstance;
  let configSpy: jest.SpyInstance;
  let pseudoSpy: jest.SpyInstance;
  let getJsonSpy: jest.SpyInstance;
  let networkMapSpy: jest.SpyInstance;

  beforeEach(() => {
    transSpy = jest.spyOn(globalManager._transactionHistory, "query").mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ["MOCK-QUERY"]),
              },
            })
          : reject(new Error("Not AQL Query"));
      });
    });
    configSpy = jest.spyOn(globalManager._configuration, "query").mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ["MOCK-QUERY"]),
              },
            })
          : reject(new Error("Not AQL Query"));
      });
    });

    pseudoSpy = jest.spyOn(globalManager._pseudonymsDb, "query").mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ["MOCK-QUERY"]),
              },
            })
          : reject(new Error("Not AQL Query"));
      });
    });

    networkMapSpy = jest.spyOn(globalManager._networkMap, "query").mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ["MOCK-QUERY"]),
              },
            })
          : reject(new Error("Not AQL Query"));
      });
    });

    getJsonSpy = jest.spyOn(globalManager, "getJson").mockImplementation((key: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve(["MOCK-CACHE-QUERY"]);
      });
    });
  });
  it("should create a manager with transactionHistory methods", async () => {
    const testTypes = <RedisService & TransactionHistoryDB>{};
    const dbManager: typeof testTypes = globalManager;

    expect(dbManager.getCreditorPain001Msgs).toBeDefined();
    expect(dbManager.getDebitorPain001Msgs).toBeDefined();
    expect(dbManager.getSuccessfulPacs002Msgs).toBeDefined();
    expect(dbManager.getTransactionPacs008).toBeDefined();
    expect(dbManager.getTransactionGeneric).toBeDefined();

    expect(await dbManager.getCreditorPain001Msgs("test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.getDebitorPain001Msgs("test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.getSuccessfulPacs002Msgs("test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.getTransactionPacs008("test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.getTransactionGeneric("testCollection", "testFilter")).toEqual(["MOCK-QUERY"]);
    
  });

  it("should create a manager with configuration methods", async () => {
    const testTypes = <RedisService & ConfigurationDB>{};
    const dbManager: typeof testTypes = globalManager;

    expect(dbManager.getRuleConfig).toBeDefined();
    expect(dbManager.getConfigurationGeneric).toBeDefined();

    expect(await dbManager.getRuleConfig("test", "test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.getConfigurationGeneric("testCollection", "testFilter")).toEqual(["MOCK-QUERY"]);
  });

  it("should create a manager with pseudonyms methods", async () => {
    const testTypes = <RedisService & PseudonymsDB>{};
    const dbManager: typeof testTypes = globalManager;

    expect(dbManager.addAccount).toBeDefined();
    expect(dbManager.getPseudonyms).toBeDefined();
    expect(dbManager.saveTransactionRelationship).toBeDefined();
    expect(dbManager.getPseudonymGeneric).toBeDefined();

    expect(await dbManager.addAccount("test")).toEqual("MOCK-SAVE");
    expect(await dbManager.getPseudonyms("test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.saveTransactionRelationship(mockTR)).toEqual("MOCK-SAVE");
    expect(await dbManager.getPseudonymGeneric("testCollection", "testFilter")).toEqual(["MOCK-QUERY"]);
  });

  it("should create a manager with network map methods", async () => {
    const testTypes = <NetworkMapDB>{};
    const dbManager: typeof testTypes = globalManager;

    expect(dbManager.getNetworkMap).toBeDefined();

    expect(await dbManager.getNetworkMap()).toEqual(["MOCK-QUERY"]);
  });

  it("should create a manager with all methods", async () => {
    const testTypes = <RedisService & TransactionHistoryDB & ConfigurationDB & PseudonymsDB>{};
    const dbManager: typeof testTypes = globalManager;

    // transactionHistory
    expect(dbManager.getCreditorPain001Msgs).toBeDefined();
    expect(dbManager.getDebitorPain001Msgs).toBeDefined();
    expect(dbManager.getSuccessfulPacs002Msgs).toBeDefined();
    expect(dbManager.getTransactionPacs008).toBeDefined();
    expect(dbManager.getTransactionGeneric).toBeDefined();

    expect(await dbManager.getCreditorPain001Msgs("test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.getDebitorPain001Msgs("test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.getSuccessfulPacs002Msgs("test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.getTransactionPacs008("test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.getTransactionGeneric("testCollection", "testFilter")).toEqual(["MOCK-QUERY"]);

    // configuration
    expect(dbManager.getRuleConfig).toBeDefined();
    expect(dbManager.getConfigurationGeneric).toBeDefined();

    expect(await dbManager.getRuleConfig("test", "test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.getConfigurationGeneric("testCollection", "testFilter")).toEqual(["MOCK-QUERY"]);

    // pseudonyms
    expect(dbManager.addAccount).toBeDefined();
    expect(dbManager.getPseudonyms).toBeDefined();
    expect(dbManager.saveTransactionRelationship).toBeDefined();
    expect(dbManager.getPseudonymGeneric).toBeDefined();

    expect(await dbManager.addAccount("test")).toEqual("MOCK-SAVE");
    expect(await dbManager.getPseudonyms("test")).toEqual(["MOCK-QUERY"]);
    expect(await dbManager.saveTransactionRelationship(mockTR)).toEqual("MOCK-SAVE");
    expect(await dbManager.getPseudonymGeneric("testCollection", "testFilter")).toEqual(["MOCK-QUERY"]);
  });

  it("should use cache for pacs008 when provided cacheKey", async () => {
    const testTypes = <RedisService & TransactionHistoryDB>{};
    const dbManager: typeof testTypes = globalManager;

    expect(await dbManager.getTransactionPacs008("test", "test-cache")).toEqual(["MOCK-CACHE-QUERY"]);
  });

  it("should use cert if path valid", async () => {
    const cert_config = {
      redisConfig: redisConfig,
      transactionHistory: {
        ...transactionHistoryConfig,
        certPath: "./__tests__/fake-cert.crt",
      },
      configuration: {
        ...configurationConfig,
        certPath: "./__tests__/fake-cert.crt",
      },
      pseudonyms: {
        ...pseudonymsConfig,
        certPath: "./__tests__/fake-cert.crt",
      },
      networkMap: {
        ...networkMapConfig,
        certPath: "./__tests__/fake-cert.crt",
      },
    };
    const dbManager = await CreateDatabaseManager(cert_config);

    // Requires dbManager spies if executing methods

    // transactionHistory
    expect(dbManager.getCreditorPain001Msgs).toBeDefined();
    expect(dbManager.getDebitorPain001Msgs).toBeDefined();
    expect(dbManager.getSuccessfulPacs002Msgs).toBeDefined();
    expect(dbManager.getTransactionPacs008).toBeDefined();

    // configuration
    expect(dbManager.getRuleConfig).toBeDefined();

    // pseudonyms
    expect(dbManager.addAccount).toBeDefined();
    expect(dbManager.getPseudonyms).toBeDefined();
    expect(dbManager.saveTransactionRelationship).toBeDefined();

    // network map
    expect(dbManager.getNetworkMap).toBeDefined();

    dbManager.quit();
  });

  it("should create a manager with transactionHistory methods - no cache", async () => {
    const cert_config = {
      transactionHistory: {
        ...transactionHistoryConfig,
      },
    };
    const dbManager = await CreateDatabaseManager(cert_config);

    jest.spyOn(dbManager._transactionHistory, "query").mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ["MOCK-QUERY"]),
              },
            })
          : reject(new Error("Not AQL Query"));
      });
    });

    expect(dbManager.getTransactionPacs008).toBeDefined();
    expect(await dbManager.getTransactionPacs008("test")).toEqual(["MOCK-QUERY"]);    
    
    dbManager.quit();
  });
});
