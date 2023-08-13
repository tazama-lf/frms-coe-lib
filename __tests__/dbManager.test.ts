import { AqlLiteral, isAqlQuery } from 'arangojs/aql';
import { ConfigurationDB, PseudonymsDB, RedisService, TransactionHistoryDB } from '../src';
import * as isDatabaseReady from '../src/helpers/readyCheck';
import { AccountType, NetworkMap, Pacs002, TransactionRelationship, Typology } from '../src/interfaces';
import { CreateDatabaseManager, DatabaseManagerInstance, NetworkMapDB } from '../src/services/dbManager';

// redis and aragojs are mocked
// setup.jest.js

const redisConfig = {
  db: 0,
  servers: [
    {
      host: 'Test',
      port: 63792,
    },
  ],
  password: 'Test',
  isCluster: false,
};

const transactionHistoryConfig = {
  certPath: 'TestHistory',
  databaseName: 'TestHistory',
  user: 'TestHistory',
  password: 'TestHistory',
  url: 'TestHistory',
};

const configurationConfig = {
  certPath: 'TestConfiguration',
  databaseName: 'TestConfiguration',
  user: 'TestConfiguration',
  password: 'TestConfiguration',
  url: 'TestConfiguration',
  localCacheEnabled: true,
  localCacheTTL: 10,
};

const configurationConfigNoCache = {
  certPath: 'TestConfiguration',
  databaseName: 'TestConfiguration',
  user: 'TestConfiguration',
  password: 'TestConfiguration',
  url: 'TestConfiguration',
};

const pseudonymsConfig = {
  certPath: 'TestPseudonym',
  databaseName: 'TestPseudonym',
  user: 'TestPseudonym',
  password: 'TestPseudonym',
  url: 'TestPseudonym',
};

const networkMapConfig = {
  certPath: 'TestNetworkMap',
  databaseName: 'TestNetworkMap',
  user: 'TestNetworkMap',
  password: 'TestNetworkMap',
  url: 'TestNetworkMap',
};

const mockTR: TransactionRelationship = {
  CreDtTm: 'MOCK-CreDtTm',
  EndToEndId: 'MOCK-EndToEndId',
  from: 'MOCK-from',
  MsgId: 'MOCK-MsgId',
  PmtInfId: 'MOCK-PmtInfId',
  to: 'MOCK-to',
  TxTp: 'MOCK-TxTp',
  Amt: 'MOCK-Amt',
  Ccy: 'MOCK-Ccy',
};
const config = {
  redisConfig: redisConfig,
  transactionHistory: transactionHistoryConfig,
  configuration: configurationConfig,
  pseudonyms: pseudonymsConfig,
  networkMap: networkMapConfig,
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

const getMockRequest = (): Pacs002 => {
  const pacs002 = JSON.parse(
    '{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"136a-dbb6-43d8-a565-86b8f322411e","CreDtTm":"2023-02-03T09:53:58.069Z"},"TxInfAndSts":{"OrgnlInstrId":"5d158d92f70142a6ac7ffba30ac6c2db","OrgnlEndToEndId":"701b-ae14-46fd-a2cf-88dda2875fdd","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}}},{"Amt":{"Amt":300.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2023-02-03T09:53:58.069Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"typolog028"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}}',
  );

  return pacs002;
};

const getMockNetworkMap = (): NetworkMap => {
  return JSON.parse(
    '{"messages":[{"id":"001@1.0.0","host":"http://openfaas:8080","cfg":"1.0.0","txTp":"pain.001.001.11","channels":[{"id":"001@1.0.0","host":"http://openfaas:8080","cfg":"1.0.0","typologies":[{"id":"028@1.0.0","host":"https://example.com/off-frm-typology-processor","cfg":"1.0.0","rules":[{"id":"003@1.0.0","host":"http://openfaas:8080","cfg":"1.0.0"}]},{"id":"029@1.0.0","host":"https://example.com/function/off-frm-typology-processor","cfg":"1.0.0","rules":[{"id":"003@1.0.0","host":"http://openfaas:8080","cfg":"1.0.0"},{"id":"004@1.0.0","host":"http://openfaas:8080","cfg":"1.0.0"}]}]}]}]}',
  );
};

const getMockTypology = (): Typology => {
  return new Typology('testId', 'testCfg', 'testHost');
};

describe('CreateDatabaseManager', () => {
  beforeEach(() => {
    jest.spyOn(globalManager._transactionHistory, 'query').mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ['MOCK-QUERY']),
              },
            })
          : reject(new Error('Not AQL Query'));
      });
    });
    jest.spyOn(globalManager._configuration, 'query').mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ['MOCK-QUERY']),
              },
            })
          : reject(new Error('Not AQL Query'));
      });
    });

    jest.spyOn(globalManager._pseudonymsDb, 'query').mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ['MOCK-QUERY']),
              },
            })
          : reject(new Error('Not AQL Query'));
      });
    });

    jest.spyOn(globalManager._networkMap, 'query').mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ['MOCK-QUERY']),
              },
            })
          : reject(new Error('Not AQL Query'));
      });
    });

    jest.spyOn(globalManager, 'getMembers').mockImplementation((key: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve(['MOCK-CACHE-QUERY']);
      });
    });
  });
  it('should create a manager with transactionHistory methods', async () => {
    const testTypes = <RedisService & TransactionHistoryDB>{};
    const dbManager: typeof testTypes = globalManager;

    const testPacs002: Pacs002 = getMockRequest();
    const testNetworkMap: NetworkMap = getMockNetworkMap();

    expect(dbManager.queryTransactionDB).toBeDefined();
    expect(dbManager.getTransactionPacs008).toBeDefined();
    expect(dbManager.getDebtorPain001Msgs).toBeDefined();
    expect(dbManager.getCreditorPain001Msgs).toBeDefined();
    expect(dbManager.getSuccessfulPacs002Msgs).toBeDefined();
    expect(dbManager.getSuccessfulPacs002EndToEndIds).toBeDefined();
    expect(dbManager.getDebtorPacs002Msgs).toBeDefined();
    expect(dbManager.getEquivalentPain001Msg).toBeDefined();
    expect(dbManager.getAccountEndToEndIds).toBeDefined();
    expect(dbManager.getAccountHistoryPacs008Msgs).toBeDefined();
    expect(dbManager.saveTransactionHistory).toBeDefined();
    expect(dbManager.insertTransaction).toBeDefined();

    expect(await dbManager.queryTransactionDB('testCollection', 'testFilter')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.queryTransactionDB('testCollection', 'testFilter', 10)).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getTransactionPacs008('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getTransactionPain001('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getDebtorPain001Msgs('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getCreditorPain001Msgs('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getSuccessfulPacs002Msgs('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getSuccessfulPacs002EndToEndIds(['test'])).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getDebtorPacs002Msgs('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getEquivalentPain001Msg(['test'])).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getAccountEndToEndIds('test', AccountType.CreditorAcct)).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getAccountEndToEndIds('test', AccountType.DebtorAcct)).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getAccountHistoryPacs008Msgs('test', AccountType.CreditorAcct)).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getAccountHistoryPacs008Msgs('test', AccountType.DebtorAcct)).toEqual(['MOCK-QUERY']);
    expect(await dbManager.saveTransactionHistory(testPacs002, 'testCollection')).toEqual('MOCK-SAVE');
    expect(await dbManager.insertTransaction('testID', testPacs002, testNetworkMap, {})).toEqual('MOCK-SAVE');
  });

  it('should create a manager with configuration methods', async () => {
    const testTypes = <RedisService & ConfigurationDB>{};
    const dbManager: typeof testTypes = globalManager;

    expect(dbManager.queryConfigurationDB).toBeDefined();
    expect(dbManager.getRuleConfig).toBeDefined();
    expect(dbManager.getTransactionConfig).toBeDefined();
    expect(dbManager.getTypologyExpression).toBeDefined();

    expect(await dbManager.queryConfigurationDB('testCollection', 'testFilter')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.queryConfigurationDB('testCollection', 'testFilter', 10)).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getRuleConfig('test', 'test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getTransactionConfig()).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getTypologyExpression(getMockTypology())).toEqual(['MOCK-QUERY']);
  });

  it('should create a manager with pseudonyms methods', async () => {
    const testTypes = <RedisService & PseudonymsDB>{};
    const dbManager: typeof testTypes = globalManager;

    expect(dbManager.queryPseudonymDB).toBeDefined();
    expect(dbManager.getPseudonyms).toBeDefined();
    expect(dbManager.addAccount).toBeDefined();
    expect(dbManager.saveTransactionRelationship).toBeDefined();
    expect(dbManager.getPacs008Edge).toBeDefined();
    expect(dbManager.getPacs008Edges).toBeDefined();
    expect(dbManager.getPacs002Edge).toBeDefined();
    expect(dbManager.getDebtorPacs002Edges).toBeDefined();
    expect(dbManager.getSuccessfulPacs002Edges).toBeDefined();
    expect(dbManager.getDebtorPacs008Edges).toBeDefined();
    expect(dbManager.getCreditorPacs008Edges).toBeDefined();
    expect(dbManager.getPreviousPacs008Edges).toBeDefined();
    expect(dbManager.getCreditorPacs002Edges).toBeDefined();
    expect(dbManager.getIncomingPacs002Edges).toBeDefined();
    expect(dbManager.getOutgoingPacs002Edges).toBeDefined();
    expect(dbManager.saveAccount).toBeDefined();
    expect(dbManager.saveAccountHolder).toBeDefined();
    expect(dbManager.saveEntity).toBeDefined();

    expect(await dbManager.queryPseudonymDB('testCollection', 'testFilter')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.queryPseudonymDB('testCollection', 'testFilter', 10)).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getPseudonyms('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.addAccount('test')).toEqual('MOCK-SAVE');
    expect(await dbManager.saveTransactionRelationship(mockTR)).toEqual('MOCK-SAVE');
    expect(await dbManager.getPacs008Edge(['test'])).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getPacs008Edges('test', 'test', 1000)).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getPacs002Edge(['test'])).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getDebtorPacs002Edges('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getSuccessfulPacs002Edges(['test'], 'test', ['test'])).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getDebtorPacs008Edges('test', 'test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getCreditorPacs008Edges('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getPreviousPacs008Edges('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getPreviousPacs008Edges('test', 2, ['to-test-1', 'to-test-2'])).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getCreditorPacs002Edges('test', 50)).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getIncomingPacs002Edges('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getIncomingPacs002Edges('test', 50)).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getOutgoingPacs002Edges('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getOutgoingPacs002Edges('test', 50)).toEqual(['MOCK-QUERY']);
    expect(await dbManager.saveAccount('test')).toEqual('MOCK-SAVE');
    expect(await dbManager.saveAccountHolder('test', 'testID', 'testTime')).toEqual('MOCK-SAVE');
    expect(await dbManager.saveEntity('test', 'testTime')).toEqual('MOCK-SAVE');
  });

  it('should create a manager with network map methods', async () => {
    const testTypes = <NetworkMapDB>{};
    const dbManager: typeof testTypes = globalManager;

    expect(dbManager.getNetworkMap).toBeDefined();

    expect(await dbManager.getNetworkMap()).toEqual(['MOCK-QUERY']);
  });

  it('should create a manager with all methods', async () => {
    const testTypes = <RedisService & TransactionHistoryDB & ConfigurationDB & PseudonymsDB & NetworkMapDB>{};
    const dbManager: typeof testTypes = globalManager;

    // transactionHistory
    expect(dbManager.queryTransactionDB).toBeDefined();
    expect(dbManager.getTransactionPacs008).toBeDefined();
    expect(dbManager.getTransactionPain001).toBeDefined();
    expect(dbManager.getDebtorPain001Msgs).toBeDefined();
    expect(dbManager.getCreditorPain001Msgs).toBeDefined();
    expect(dbManager.getSuccessfulPacs002Msgs).toBeDefined();
    expect(dbManager.getSuccessfulPacs002EndToEndIds).toBeDefined();
    expect(dbManager.getDebtorPacs002Msgs).toBeDefined();
    expect(dbManager.getEquivalentPain001Msg).toBeDefined();
    expect(dbManager.getAccountEndToEndIds).toBeDefined();
    expect(dbManager.getAccountHistoryPacs008Msgs).toBeDefined();

    // configuration
    expect(dbManager.queryConfigurationDB).toBeDefined();
    expect(dbManager.getRuleConfig).toBeDefined();

    // pseudonyms
    expect(dbManager.queryPseudonymDB).toBeDefined();
    expect(dbManager.getPseudonyms).toBeDefined();
    expect(dbManager.addAccount).toBeDefined();
    expect(dbManager.saveTransactionRelationship).toBeDefined();
    expect(dbManager.getPacs008Edge).toBeDefined();
    expect(dbManager.getPacs008Edges).toBeDefined();
    expect(dbManager.getPacs002Edge).toBeDefined();
    expect(dbManager.getDebtorPacs002Edges).toBeDefined();
    expect(dbManager.getSuccessfulPacs002Edges).toBeDefined();
    expect(dbManager.getDebtorPacs008Edges).toBeDefined();
    expect(dbManager.getCreditorPacs008Edges).toBeDefined();
    expect(dbManager.getPreviousPacs008Edges).toBeDefined();
    expect(dbManager.getCreditorPacs002Edges).toBeDefined();

    // networkMap
    expect(dbManager.getNetworkMap).toBeDefined();
  });

  it('should use cache for pacs008 when provided cacheKey', async () => {
    const testTypes = <RedisService & TransactionHistoryDB>{};
    const dbManager: typeof testTypes = globalManager;

    expect(await dbManager.getTransactionPacs008('test', 'test-cache')).toEqual(['MOCK-CACHE-QUERY']);
  });

  it('should not try use cache for getRuleConfig when cached not enabled', async () => {
    const confConfig = {
      configuration: {
        ...configurationConfigNoCache,
      },
    };

    const dbManager = await CreateDatabaseManager(confConfig);

    jest.spyOn(dbManager._configuration, 'query').mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ['MOCK-QUERY']),
              },
            })
          : reject(new Error('Not AQL Query'));
      });
    });

    expect(await dbManager.getRuleConfig('test-ruleid', 'test-cfg')).toEqual(['MOCK-QUERY']);

    dbManager.quit();
  });

  it('should use cert if path valid', async () => {
    const cert_config = {
      redisConfig: redisConfig,
      transactionHistory: {
        ...transactionHistoryConfig,
        certPath: './__tests__/fake-cert.crt',
      },
      configuration: {
        ...configurationConfig,
        certPath: './__tests__/fake-cert.crt',
      },
      pseudonyms: {
        ...pseudonymsConfig,
        certPath: './__tests__/fake-cert.crt',
      },
      networkMap: {
        ...networkMapConfig,
        certPath: './__tests__/fake-cert.crt',
      },
    };
    const dbManager = await CreateDatabaseManager(cert_config);

    // Requires dbManager spies if executing methods

    // transactionHistory
    expect(dbManager.getCreditorPain001Msgs).toBeDefined();
    expect(dbManager.getDebtorPain001Msgs).toBeDefined();
    expect(dbManager.getSuccessfulPacs002Msgs).toBeDefined();
    expect(dbManager.getTransactionPacs008).toBeDefined();
    expect(dbManager.getTransactionPain001).toBeDefined();

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

  it('should create a manager with transactionHistory methods - no cache', async () => {
    // only transactionHistory
    const transHistoryConfig = {
      transactionHistory: {
        ...transactionHistoryConfig,
      },
    };
    const dbManager = await CreateDatabaseManager(transHistoryConfig);

    jest.spyOn(dbManager._transactionHistory, 'query').mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ['MOCK-QUERY']),
              },
            })
          : reject(new Error('Not AQL Query'));
      });
    });

    expect(dbManager.getTransactionPacs008).toBeDefined();
    expect(await dbManager.getTransactionPacs008('test')).toEqual(['MOCK-QUERY']);

    dbManager.quit();
  });

  it('should have an okay response for isReadyCheck with transactionHistoryDB', async () => {
    // only transactionHistory
    const transHistoryConfig = {
      transactionHistory: {
        ...transactionHistoryConfig,
      },
    };
    const dbManager = await CreateDatabaseManager(transHistoryConfig);

    jest.spyOn(dbManager._transactionHistory, 'query').mockImplementation((query: string | AqlLiteral): Promise<any> => {
      return new Promise((resolve, reject) => {
        isAqlQuery(query)
          ? resolve({
              batches: {
                all: jest.fn().mockImplementation(() => ['MOCK-QUERY']),
              },
            })
          : reject(new Error('Not AQL Query'));
      });
    });

    expect(dbManager.getTransactionPacs008).toBeDefined();
    expect(dbManager.getTransactionPain001).toBeDefined();
    expect(dbManager.isReadyCheck).toBeDefined();
    expect(await dbManager.getTransactionPacs008('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.getTransactionPain001('test')).toEqual(['MOCK-QUERY']);
    expect(await dbManager.isReadyCheck()).toEqual({
      TransactionHistoryDB: 'Ok',
    });

    dbManager.quit();
  });

  it('should error gracefully on isReadyCheck for database builders', async () => {
    const config = {
      redisConfig: redisConfig,
      transactionHistory: transactionHistoryConfig,
      configuration: configurationConfig,
      pseudonyms: pseudonymsConfig,
      networkMap: networkMapConfig,
    };
    // false case
    let readySpy = jest.spyOn(isDatabaseReady, 'isDatabaseReady').mockImplementation(() => Promise.resolve(false));

    let dbManager = await CreateDatabaseManager(config);
    expect(dbManager.isReadyCheck).toBeDefined();
    expect(await dbManager.isReadyCheck()).toMatchObject({
      TransactionHistoryDB: 'err',
    });
    readySpy.mockClear();
    dbManager.quit();

    // error case
    readySpy = jest.spyOn(isDatabaseReady, 'isDatabaseReady').mockRejectedValue(new Error('test error'));
    dbManager = await CreateDatabaseManager(config);
    expect(dbManager.isReadyCheck).toBeDefined();
    expect(await dbManager.isReadyCheck()).toMatchObject({
      TransactionHistoryDB: new Error('test error'),
    });

    readySpy.mockClear();
    dbManager.quit();
  });

  it('should error gracefully on isReadyCheck for redis builder', async () => {
    const config = {
      redisConfig: redisConfig,
      transactionHistory: transactionHistoryConfig,
      configuration: configurationConfig,
      pseudonyms: pseudonymsConfig,
      networkMap: networkMapConfig,
    };
    const createSpy = jest.spyOn(RedisService, 'create').mockRejectedValue(new Error('test error'));

    const dbManager = await CreateDatabaseManager(config);
    expect(dbManager.isReadyCheck).toBeDefined();
    expect(await dbManager.isReadyCheck()).toMatchObject({
      Redis: new Error('test error'),
    });

    createSpy.mockClear();
    dbManager.quit();
  });
});
