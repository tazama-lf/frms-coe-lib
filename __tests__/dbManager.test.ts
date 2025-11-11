// SPDX-License-Identifier: Apache-2.0

import { v7 } from 'uuid';
import { ConfigurationDB, EvaluationDB, EventHistoryDB, RawHistoryDB, RedisService } from '../src';
import * as isDatabaseReady from '../src/builders/utils';
import {
  ConditionEdge,
  EntityCondition,
  NetworkMap,
  Pacs002,
  Pacs008,
  Pain001,
  Pain013,
  TransactionDetails,
  Typology,
} from '../src/interfaces';
import { Alert } from '../src/interfaces/processor-files/Alert';
import { CreateDatabaseManager, DatabaseManagerInstance, LocalCacheConfig } from '../src/services/dbManager';

// redis and postgres are mocked
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

const rawHistoryConfig = {
  certPath: 'TestHistory',
  databaseName: 'TestHistory',
  user: 'TestHistory',
  password: 'TestHistory',
  host: 'TestHistory',
};

const configurationConfig = {
  certPath: 'TestConfiguration',
  databaseName: 'TestConfiguration',
  user: 'TestConfiguration',
  password: 'TestConfiguration',
  host: 'TestConfiguration',
};

const configurationConfigNoTTL = {
  certPath: 'TestConfiguration',
  databaseName: 'TestConfiguration',
  user: 'TestConfiguration',
  password: 'TestConfiguration',
  host: 'TestConfiguration',
};

const configurationConfigNoCache = {
  certPath: 'TestConfiguration',
  databaseName: 'TestConfiguration',
  user: 'TestConfiguration',
  password: 'TestConfiguration',
  host: 'TestConfiguration',
};

const eventHistoryConfig = {
  certPath: 'TestEventHistory',
  databaseName: 'TestEventHistory',
  user: 'TestEventHistory',
  password: 'TestEventHistory',
  host: 'TestEventHistory',
};

const evaluationConfig = {
  certPath: 'TestTransaction',
  databaseName: 'TestTransaction',
  user: 'TestTransaction',
  password: 'TestTransaction',
  host: 'TestTransaction',
};

const networkMapConfig = {
  certPath: 'TestNetworkMap',
  databaseName: 'TestNetworkMap',
  user: 'TestNetworkMap',
  password: 'TestNetworkMap',
  host: 'TestNetworkMap',
};

const mockTR: TransactionDetails = {
  CreDtTm: 'MOCK-CreDtTm',
  EndToEndId: 'MOCK-EndToEndId',
  source: 'MOCK-from',
  MsgId: 'MOCK-MsgId',
  destination: 'MOCK-to',
  TxTp: 'MOCK-TxTp',
  TenantId: 'MOCK-TenantID',
  Amt: 'MOCK-Amt',
  Ccy: 'MOCK-Ccy',
};

const localCacheOptions: LocalCacheConfig = {
  localCacheEnabled: true,
  localCacheTTL: 300,
};
const config = {
  redisConfig: redisConfig,
  rawHistory: rawHistoryConfig,
  configuration: configurationConfig,
  eventHistory: eventHistoryConfig,
  networkMap: networkMapConfig,
  localCacheConfig: localCacheOptions,
};

let globalManager: DatabaseManagerInstance<typeof config>;

beforeAll(async () => {
  const config = {
    redisConfig: redisConfig,
    rawHistory: rawHistoryConfig,
    configuration: configurationConfig,
    eventHistory: eventHistoryConfig,
    networkMap: networkMapConfig,
    localCacheConfig: localCacheOptions,
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
    '{"messages":[{"id":"001@1.0.0","host":"http://openfaas:8080","cfg":"1.0.0","txTp":"pain.001.001.11","typologies":[{"id":"028@1.0.0","host":"https://example.com/off-frm-typology-processor","cfg":"1.0.0","rules":[{"id":"003@1.0.0","host":"http://openfaas:8080","cfg":"1.0.0"}]},{"id":"029@1.0.0","host":"https://example.com/function/off-frm-typology-processor","cfg":"1.0.0","rules":[{"id":"003@1.0.0","host":"http://openfaas:8080","cfg":"1.0.0"},{"id":"004@1.0.0","host":"http://openfaas:8080","cfg":"1.0.0"}]}]}]}',
  );
};

const getMockTypology = (): Typology => {
  const typology: Typology = {
    id: 'testId',
    cfg: 'testCfg',
    rules: [],
  };
  return typology;
};

describe('CreateDatabaseManager', () => {
  beforeEach(() => {
    jest.spyOn(globalManager._rawHistory, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ document: 'MOCK-QUERY' }],
        });
      });
    });
    jest.spyOn(globalManager._configuration, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ configuration: 'MOCK-QUERY' }],
        });
      });
    });

    jest.spyOn(globalManager._eventHistory, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [
            'MOCK-QUERY', // for save calls
            { condition: 'MOCK-QUERY' }, // for condition queries,
          ],
        });
      });
    });
  });
  it('should create a manager with rawHistory methods', async () => {
    const testTypes = <RedisService & RawHistoryDB>{};
    const dbManager: typeof testTypes = globalManager satisfies RawHistoryDB;

    const testPacs002: Pacs002 = getMockRequest();

    expect(dbManager.saveTransactionHistoryPain001).toBeDefined();
    expect(dbManager.saveTransactionHistoryPain013).toBeDefined();
    expect(dbManager.saveTransactionHistoryPacs008).toBeDefined();
    expect(dbManager.saveTransactionHistoryPacs002).toBeDefined();

    expect(await dbManager.getTransactionPacs008('test', 'tenantId')).toEqual('MOCK-QUERY');
    expect(await dbManager.saveTransactionHistoryPain001(testPacs002 as unknown as Pain001)).toEqual(undefined);
    expect(await dbManager.saveTransactionHistoryPain013(testPacs002 as unknown as Pain013)).toEqual(undefined);
    expect(await dbManager.saveTransactionHistoryPacs008(testPacs002 as unknown as Pacs008)).toEqual(undefined);
    expect(await dbManager.saveTransactionHistoryPacs002(testPacs002)).toEqual(undefined);
  });

  it('should create a manager with configuration methods', async () => {
    const testTypes = <RedisService & ConfigurationDB>{};
    const dbManager: typeof testTypes = globalManager satisfies ConfigurationDB;

    expect(dbManager.getRuleConfig).toBeDefined();
    expect(dbManager.getTypologyConfig).toBeDefined();

    expect(await dbManager.getRuleConfig('test', 'test', 'DEFAULT')).toEqual('MOCK-QUERY');
    expect(await dbManager.getTypologyConfig(getMockTypology().id, getMockTypology().cfg, 'DEFAULT')).toEqual('MOCK-QUERY');

    // Rerun for now set cache values
    dbManager.nodeCache!.set('test_test', 'MOCK-QUERY');
    dbManager.nodeCache!.set('testId_testCfg', 'MOCK-QUERY');
    expect(await dbManager.getRuleConfig('test', 'test', 'DEFAULT')).toEqual('MOCK-QUERY');
    expect(await dbManager.getTypologyConfig(getMockTypology().id, getMockTypology().cfg, 'DEFAULT')).toEqual('MOCK-QUERY');

    // Cleanup
    dbManager.nodeCache!.del('test_test'); // getRuleConfig && getTransactionConfig
    dbManager.nodeCache!.del('testId_testCfg'); // getTypologyConfig
  });

  it('should create a manager with configuration methods - No TTL', async () => {
    const confConfig = {
      configuration: {
        ...configurationConfigNoTTL,
      },
    };

    const dbManager = await CreateDatabaseManager(confConfig);

    jest.spyOn(dbManager._configuration, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ configuration: 'MOCK-QUERY' }],
        });
      });
    });

    expect(dbManager.getRuleConfig).toBeDefined();
    expect(dbManager.getTypologyConfig).toBeDefined();

    expect(await dbManager.getRuleConfig('test', 'test', 'DEFAULT')).toEqual('MOCK-QUERY');
    expect(await dbManager.getTypologyConfig(getMockTypology().id, getMockTypology().cfg, 'tenantId')).toEqual('MOCK-QUERY');

    dbManager.quit();
  });

  it('should create a manager with eventHistory methods', async () => {
    const testTypes = <RedisService & EventHistoryDB>{};
    const dbManager: typeof testTypes = globalManager satisfies EventHistoryDB;

    expect(dbManager.saveTransactionDetails).toBeDefined();
    expect(dbManager.saveAccount).toBeDefined();
    expect(dbManager.saveAccountHolder).toBeDefined();
    expect(dbManager.saveEntity).toBeDefined();
    expect(dbManager.saveCondition).toBeDefined();
    expect(dbManager.saveGovernedAsCreditorByEdge).toBeDefined();
    expect(dbManager.saveGovernedAsCreditorAccountByEdge).toBeDefined();
    expect(dbManager.saveGovernedAsDebtorAccountByEdge).toBeDefined();
    expect(dbManager.saveGovernedAsDebtorByEdge).toBeDefined();
    expect(dbManager.getConditions).toBeDefined();
    expect(dbManager.getEntityConditionsByGraph).toBeDefined();
    expect(dbManager.getAccountConditionsByGraph).toBeDefined();
    expect(dbManager.getEntity).toBeDefined();
    expect(dbManager.getAccount).toBeDefined();
    expect(dbManager.updateCondition).toBeDefined();

    expect(await dbManager.saveTransactionDetails(mockTR)).toEqual(undefined);
    expect(await dbManager.saveAccount('test', 'tenantId')).toEqual(undefined);
    expect(await dbManager.saveAccountHolder('test', 'testID', 'testTime', 'tenantId')).toEqual(undefined);
    expect(await dbManager.saveEntity('test', 'tenantId', 'testTime')).toEqual(undefined);
    expect(await dbManager.saveCondition({} as EntityCondition)).toEqual(undefined);
    expect(await dbManager.saveGovernedAsCreditorByEdge('test1', 'test2', {} as ConditionEdge)).toEqual('MOCK-QUERY');
    expect(await dbManager.saveGovernedAsDebtorByEdge('test1', 'test2', {} as ConditionEdge)).toEqual('MOCK-QUERY');
    expect(await dbManager.saveGovernedAsCreditorAccountByEdge('test1', 'test2', {} as ConditionEdge)).toEqual('MOCK-QUERY');
    expect(await dbManager.saveGovernedAsDebtorAccountByEdge('test1', 'test2', {} as ConditionEdge)).toEqual('MOCK-QUERY');
    expect(await dbManager.getConditions(true, 'tenantId')).toContainEqual('MOCK-QUERY');
    expect(await dbManager.getEntity('test1', 'test2', 'tenantId')).toEqual('MOCK-QUERY');
    expect(await dbManager.getAccount('test1', 'test2', 'test3', 'tenantId')).toEqual('MOCK-QUERY');
    expect(
      await dbManager.updateExpiryDateOfDebtorAccountEdges('sourceKey', 'destinationKey', '2024-09-05T21:00:00.999Z', 'tenantId'),
    ).toEqual(undefined);
    expect(
      await dbManager.updateExpiryDateOfCreditorAccountEdges('sourceKey', 'destinationKey', '2024-09-05T21:00:00.999Z', 'tenantId'),
    ).toEqual(undefined);
    expect(
      await dbManager.updateExpiryDateOfDebtorEntityEdges('sourceKey', 'destinationKey', '2024-09-05T21:00:00.999Z', 'tenantId'),
    ).toEqual(undefined);
    expect(
      await dbManager.updateExpiryDateOfCreditorEntityEdges('sourceKey', 'destinationKey', '2024-09-05T21:00:00.999Z', 'tenantId'),
    ).toEqual(undefined);
    expect(await dbManager.updateCondition('_testkey1', '2024-09-05T21:00:00.999Z', 'tenantId')).toEqual(undefined);
    jest.spyOn(globalManager._eventHistory, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ result_gov: { governed_as_creditor_by: 'MOCK-QUERY', governed_as_debtor_by: 'MOCK-QUERY' } }],
        });
      });
    });
    expect(await dbManager.getEntityConditionsByGraph('test1', 'test2', 'tenantId')).toEqual([
      { governed_as_creditor_by: 'MOCK-QUERY', governed_as_debtor_by: 'MOCK-QUERY' },
    ]);
    expect(await dbManager.getEntityConditionsByGraph('test1', 'test2', 'tenantId', true)).toEqual([
      { governed_as_creditor_by: 'MOCK-QUERY', governed_as_debtor_by: 'MOCK-QUERY' },
    ]);
    jest.spyOn(globalManager._eventHistory, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ result_gov: { governed_as_creditor_account_by: 'MOCK-QUERY', governed_as_debtor_account_by: 'MOCK-QUERY' } }],
        });
      });
    });
    expect(await dbManager.getAccountConditionsByGraph('test1', 'test2', 'tenantId', 'ntty')).toEqual([
      { governed_as_creditor_account_by: 'MOCK-QUERY', governed_as_debtor_account_by: 'MOCK-QUERY' },
    ]);
    expect(await dbManager.getAccountConditionsByGraph('test1', 'test2', 'tenantId', 'ntty', true)).toEqual([
      { governed_as_creditor_account_by: 'MOCK-QUERY', governed_as_debtor_account_by: 'MOCK-QUERY' },
    ]);
  });

  it('should create a manager with redis methods', async () => {
    const testTypes = <RedisService>{};
    const dbManager: typeof testTypes = globalManager satisfies RedisService;

    expect(dbManager.set).toBeDefined();
    expect(dbManager.getJson).toBeDefined();
    expect(dbManager.getBuffer).toBeDefined();
    expect(dbManager.getMemberValues).toBeDefined();
    expect(dbManager.deleteKey).toBeDefined();
    expect(dbManager.setJson).toBeDefined();
    expect(dbManager.setAdd).toBeDefined();
    expect(dbManager.addOneGetAll).toBeDefined();
    expect(dbManager.addOneGetCount).toBeDefined();

    // Future: Requires rework to accurately test FRMSMessage standards
    expect(await dbManager.set('testKey', 'testValue', 10000)).toEqual(undefined);
    expect(await dbManager.getJson('testKey')).toEqual('testValue');
    expect(await dbManager.getBuffer('testKey')).toBeDefined();
    expect(await dbManager.setAdd('testSetKey', { key: 'testValue' })).toBeUndefined();
    expect(await dbManager.getMemberValues('testSetKey')).toBeDefined();
    expect(await dbManager.setJson('testKey', 'testValue', 10000)).toBeUndefined();
    expect(await dbManager.addOneGetAll('testSetKey', { key: { innerKey: 'innerValue' } })).toBeDefined();
    expect(await dbManager.addOneGetCount('testSetKey', { key: { innerKey: 'innerValue' } })).toBeDefined();
    expect(await dbManager.deleteKey('testKey')).toBeUndefined();
  });

  it('should create a manager with all methods', async () => {
    const testTypes = <RedisService & RawHistoryDB & ConfigurationDB & EventHistoryDB>{};
    const dbManager: typeof testTypes = globalManager;

    // rawHistory
    expect(dbManager.getTransactionPacs008).toBeDefined();

    // configuration
    expect(dbManager.getRuleConfig).toBeDefined();
    expect(dbManager.getNetworkMap).toBeDefined();
    expect(dbManager.getTypologyConfig).toBeDefined();

    // eventHistory
    expect(dbManager.saveTransactionDetails).toBeDefined();
    expect(dbManager.saveGovernedAsCreditorAccountByEdge).toBeDefined();
    expect(dbManager.saveGovernedAsDebtorAccountByEdge).toBeDefined();

    // networkMap
    expect(dbManager.getNetworkMap).toBeDefined();

    // redisService
    expect(dbManager.getJson).toBeDefined();
    expect(dbManager.getBuffer).toBeDefined();
    expect(dbManager.getMemberValues).toBeDefined();
    expect(dbManager.deleteKey).toBeDefined();
    expect(dbManager.setJson).toBeDefined();
    expect(dbManager.set).toBeDefined();
    expect(dbManager.setAdd).toBeDefined();
    expect(dbManager.addOneGetAll).toBeDefined();
    expect(dbManager.addOneGetCount).toBeDefined();
  });

  it(`should return a networkmap`, async () => {
    expect(await globalManager.getNetworkMap()).toEqual(['MOCK-QUERY']);
  });

  it('should not try use cache for getRuleConfig when cached not enabled', async () => {
    const confConfig = {
      configuration: {
        ...configurationConfigNoCache,
      },
    };

    const dbManager = await CreateDatabaseManager(confConfig);

    jest.spyOn(dbManager._configuration, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ configuration: 'MOCK-QUERY' }],
        });
      });
    });

    expect(await dbManager.getRuleConfig('test-ruleid', 'test-cfg', 'DEFAULT')).toEqual('MOCK-QUERY');

    dbManager.quit();
  });

  it('should try to use cache for getRuleConfig when cached enabled', async () => {
    jest.spyOn(globalManager._configuration, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ configuration: 'MOCK-QUERY' }],
        });
      });
    });

    expect(await globalManager.getRuleConfig('test-ruleid', 'test-cfg', 'DEFAULT')).toEqual('MOCK-QUERY');
  });

  it('should not try use cache for getTypologyConfig when cached not enabled', async () => {
    const confConfig = {
      configuration: {
        ...configurationConfigNoCache,
      },
    };

    const dbManager = await CreateDatabaseManager(confConfig);

    jest.spyOn(dbManager._configuration, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ configuration: 'MOCK-QUERY' }],
        });
      });
    });

    expect(await dbManager.getTypologyConfig(getMockTypology().id, getMockTypology().cfg, 'DEFAULT')).toEqual('MOCK-QUERY');

    dbManager.quit();
  });

  it('should not try use cache for getTypologyConfig when cached not enabled', async () => {
    jest.spyOn(globalManager._configuration, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ configuration: 'MOCK-QUERY' }],
        });
      });
    });

    expect(await globalManager.getTypologyConfig(getMockTypology().id, getMockTypology().cfg, 'DEFAULT')).toEqual('MOCK-QUERY');
  });

  it('should use cert if path valid', async () => {
    const cert_config = {
      redisConfig: redisConfig,
      rawHistory: {
        ...rawHistoryConfig,
        certPath: './__tests__/fake-cert.crt',
      },
      evaluation: {
        ...evaluationConfig,
        certPath: './__tests__/fake-cert.crt',
      },
      configuration: {
        ...configurationConfig,
        certPath: './__tests__/fake-cert.crt',
      },
      eventHistory: {
        ...eventHistoryConfig,
        certPath: './__tests__/fake-cert.crt',
      },
      networkMap: {
        ...networkMapConfig,
        certPath: './__tests__/fake-cert.crt',
      },
    };
    const dbManager = await CreateDatabaseManager(cert_config);

    // Requires dbManager spies if executing methods

    // rawHistory
    expect(dbManager.getTransactionPacs008).toBeDefined();

    // configuration
    expect(dbManager.getRuleConfig).toBeDefined();

    // eventHistory
    expect(dbManager.saveTransactionDetails).toBeDefined();

    // network map
    expect(dbManager.getNetworkMap).toBeDefined();

    dbManager.quit();
  });

  it('should create a manager with rawHistory methods - no cache', async () => {
    // only rawHistory
    const transHistoryConfig = {
      rawHistory: {
        ...rawHistoryConfig,
      },
    };
    const dbManager = await CreateDatabaseManager(transHistoryConfig);

    jest.spyOn(dbManager._rawHistory, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ document: 'MOCK-QUERY' }],
        });
      });
    });

    expect(dbManager.getTransactionPacs008).toBeDefined();
    expect(await dbManager.getTransactionPacs008('test', 'tenantId')).toEqual('MOCK-QUERY');

    dbManager.quit();
  });

  it('should have an okay response for isReadyCheck with RawHistoryDB', async () => {
    // only rawHistory
    const transHistoryConfig = {
      rawHistory: {
        ...rawHistoryConfig,
      },
    };
    const dbManager = await CreateDatabaseManager(transHistoryConfig);

    jest.spyOn(dbManager._rawHistory, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ document: 'MOCK-QUERY' }],
        });
      });
    });

    expect(dbManager.getTransactionPacs008).toBeDefined();
    expect(dbManager.isReadyCheck).toBeDefined();
    expect(await dbManager.getTransactionPacs008('test', 'tenantId')).toEqual('MOCK-QUERY');
    expect(await dbManager.isReadyCheck()).toEqual({
      RawHistoryDB: 'Ok',
    });

    dbManager.quit();
  });

  it('should create saveEvaluationResult function when evaluation db is defined', async () => {
    const localConfig = {
      evaluation: evaluationConfig,
    };
    let localManager: DatabaseManagerInstance<typeof localConfig>;
    localManager = await CreateDatabaseManager(localConfig);

    jest.spyOn(localManager._evaluation, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ document: 'MOCK-QUERY' }],
        });
      });
    });

    const testPacs002: Pacs002 = getMockRequest();
    const testNetworkMap: NetworkMap = getMockNetworkMap();

    const alert: Alert = {
      evaluationID: v7(),
      status: 'NALT',
      tadpResult: { cfg: '', id: '', typologyResult: [] },
      timestamp: new Date().toISOString(),
    };

    const testTypes = <EvaluationDB>{};
    const dbManager: typeof testTypes = localManager as any;

    expect(dbManager.saveEvaluationResult).toBeDefined();

    expect(await dbManager.saveEvaluationResult('testID', testPacs002, testNetworkMap, alert)).toEqual(undefined);
  });

  it('should create getReportByMessageId function when evaluation db is defined', async () => {
    const localConfig = {
      evaluation: evaluationConfig,
    };
    let localManager: DatabaseManagerInstance<typeof localConfig>;
    localManager = await CreateDatabaseManager(localConfig);

    jest.spyOn(localManager._evaluation, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{ evaluation: 'MOCK-EVALUATION' }],
        });
      });
    });

    const testTypes = <EvaluationDB>{};
    const dbManager: typeof testTypes = localManager as any;

    expect(dbManager.getReportByMessageId).toBeDefined();
    expect(await dbManager.getReportByMessageId('MSGID', 'tenantId')).toEqual('MOCK-EVALUATION');
  });

  it('should error gracefully on isReadyCheck for database builders', async () => {
    const config = {
      redisConfig: redisConfig,
      rawHistory: rawHistoryConfig,
      evaluation: evaluationConfig,
      configuration: configurationConfig,
      eventHistory: eventHistoryConfig,
      networkMap: networkMapConfig,
    };
    // false case
    let readySpy = jest.spyOn(isDatabaseReady, 'isDatabaseReady').mockImplementationOnce(() => Promise.resolve(false));

    try {
      await CreateDatabaseManager(config);
    } catch (error) {
      expect(error).toBeDefined();
    }
    readySpy.mockClear();

    // error case
    readySpy = jest.spyOn(isDatabaseReady, 'isDatabaseReady').mockRejectedValue(new Error('test error'));
    try {
      await CreateDatabaseManager(config);
    } catch (error) {
      expect(error).toBeDefined();
    }
    readySpy.mockClear();
  });

  it('should error gracefully on isReadyCheck for redis builder', async () => {
    const config = {
      redisConfig: redisConfig,
      rawHistory: rawHistoryConfig,
      evaluation: evaluationConfig,
      configuration: configurationConfig,
      eventHistory: eventHistoryConfig,
      networkMap: networkMapConfig,
    };
    const createSpy = jest.spyOn(RedisService, 'create').mockRejectedValueOnce(new Error('test error'));

    try {
      await CreateDatabaseManager(config);
    } catch (error) {
      expect(error).toBeDefined();
    }

    createSpy.mockClear();
  });
});
