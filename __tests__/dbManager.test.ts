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
import { QuarantineRecord } from '../src/interfaces/DEMS/QuarantineRecord';
import { TrackedFields } from '../src/interfaces/DEMS/TrackedFields';
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
  Amt: 123,
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
    expect(await dbManager.saveAccount('test', 'tenantId', 'testTime')).toEqual(undefined);
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

  it('should test saveToQuarantine function', async () => {
    const transHistoryConfig = {
      rawHistory: {
        ...rawHistoryConfig,
      },
    };
    const dbManager = await CreateDatabaseManager(transHistoryConfig);

    jest.spyOn(dbManager._rawHistory, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve) => {
        resolve({ rows: [] });
      });
    });

    const mockQuarantineRecord: QuarantineRecord = {
      id: 'test-id',
      correlation_id: 'correlation-123',
      tenant_id: 'tenant-1',
      endpoint_path: '/api/test',
      config_id: 'config-123',
      version: '1.0.0',
      error: 'Test error message',
      raw_payload: '{}',
      status: 'QUARANTINED',
    };

    expect(dbManager.saveToQuarantine).toBeDefined();
    expect(await dbManager.saveToQuarantine(mockQuarantineRecord)).toEqual(undefined);

    dbManager.quit();
  });

  it('should test saveDynamicTransactionHistory function', async () => {
    const transHistoryConfig = {
      rawHistory: {
        ...rawHistoryConfig,
      },
    };
    const dbManager = await CreateDatabaseManager(transHistoryConfig);

    jest.spyOn(dbManager._rawHistory, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve) => {
        resolve({ rows: [] });
      });
    });

    const mockTransaction: Record<string, unknown> = {
      id: 'transaction-123',
      amount: 1000,
      currency: 'USD',
    };

    const mockTrackedFields: TrackedFields = {
      CreDtTm: '2023-01-01T10:00:00Z',
      MsgId: 'msg-123',
      EndToEndId: 'e2e-123',
      dbtrAcctId: 'debtor-account-123',
      cdtrAcctId: 'creditor-account-123',
      TenantId: 'tenant-1',
    };

    expect(dbManager.saveDynamicTransactionHistory).toBeDefined();
    expect(await dbManager.saveDynamicTransactionHistory('test_table', mockTransaction, mockTrackedFields)).toEqual(undefined);

    // Test without required trackedFields (should now throw errors due to validation)
    await expect(dbManager.saveDynamicTransactionHistory('test_table_2', mockTransaction)).rejects.toThrow(
      'EndToEndId is required for transaction history - records without EndToEndId cannot be retrieved',
    );

    dbManager.quit();
  });

  it('should test saveDynamicTransactionHistory function with invalid table name', async () => {
    const transHistoryConfig = {
      rawHistory: {
        ...rawHistoryConfig,
      },
    };
    const dbManager = await CreateDatabaseManager(transHistoryConfig);

    const mockTransaction: Record<string, unknown> = {
      id: 'transaction-123',
    };

    expect(dbManager.saveDynamicTransactionHistory).toBeDefined();

    // Test invalid table names
    await expect(dbManager.saveDynamicTransactionHistory('123invalid', mockTransaction)).rejects.toThrow(
      'Invalid table name format: 123invalid. Table names must start with a letter or underscore and contain only letters, digits, and underscores (max 63 characters).',
    );

    await expect(dbManager.saveDynamicTransactionHistory('table-with-dashes', mockTransaction)).rejects.toThrow(
      'Invalid table name format: table-with-dashes. Table names must start with a letter or underscore and contain only letters, digits, and underscores (max 63 characters).',
    );

    await expect(dbManager.saveDynamicTransactionHistory('table with spaces', mockTransaction)).rejects.toThrow(
      'Invalid table name format: table with spaces. Table names must start with a letter or underscore and contain only letters, digits, and underscores (max 63 characters).',
    );

    dbManager.quit();
  });

  it('should test saveDynamicTransactionHistory function with missing required tracked fields', async () => {
    const transHistoryConfig = {
      rawHistory: {
        ...rawHistoryConfig,
      },
    };
    const dbManager = await CreateDatabaseManager(transHistoryConfig);

    const mockTransaction: Record<string, unknown> = {
      id: 'transaction-123',
    };

    expect(dbManager.saveDynamicTransactionHistory).toBeDefined();

    // Test missing EndToEndId
    const trackedFieldsNoEndToEndId: TrackedFields = {
      CreDtTm: '2023-01-01T10:00:00Z',
      TenantId: 'tenant-1',
    } as TrackedFields;

    await expect(dbManager.saveDynamicTransactionHistory('test_table', mockTransaction, trackedFieldsNoEndToEndId)).rejects.toThrow(
      'EndToEndId is required for transaction history - records without EndToEndId cannot be retrieved',
    );

    // Test missing TenantId
    const trackedFieldsNoTenantId: TrackedFields = {
      CreDtTm: '2023-01-01T10:00:00Z',
      EndToEndId: 'e2e-123',
    } as TrackedFields;

    await expect(dbManager.saveDynamicTransactionHistory('test_table', mockTransaction, trackedFieldsNoTenantId)).rejects.toThrow(
      'TenantId is required for transaction history - essential for data isolation',
    );

    // Test missing CreDtTm
    const trackedFieldsNoCreDtTm: TrackedFields = {
      EndToEndId: 'e2e-123',
      TenantId: 'tenant-1',
    } as TrackedFields;

    await expect(dbManager.saveDynamicTransactionHistory('test_table', mockTransaction, trackedFieldsNoCreDtTm)).rejects.toThrow(
      'CreDtTm (creation date/time) is required for transaction history - essential for audit trail',
    );

    dbManager.quit();
  });

  it('should test getTransactionAny function', async () => {
    const transHistoryConfig = {
      rawHistory: {
        ...rawHistoryConfig,
      },
    };
    const dbManager = await CreateDatabaseManager(transHistoryConfig);

    jest.spyOn(dbManager._rawHistory, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve) => {
        resolve({
          rows: [{ document: { id: 'test-transaction', amount: 1000 } }],
        });
      });
    });

    expect(dbManager.getTransactionAny).toBeDefined();

    const result = await dbManager.getTransactionAny('e2e-123', 'tenant-1', 'test_table');
    expect(result).toEqual({ id: 'test-transaction', amount: 1000 });

    // Test when no rows are returned
    jest.spyOn(dbManager._rawHistory, 'query').mockImplementation((query: string): Promise<any> => {
      return new Promise((resolve) => {
        resolve({ rows: [] });
      });
    });

    const emptyResult = await dbManager.getTransactionAny('non-existent', 'tenant-1', 'test_table');
    expect(emptyResult).toEqual(undefined);

    dbManager.quit();
  });

  it('should test getTransactionAny function with invalid table name', async () => {
    const transHistoryConfig = {
      rawHistory: {
        ...rawHistoryConfig,
      },
    };
    const dbManager = await CreateDatabaseManager(transHistoryConfig);

    expect(dbManager.getTransactionAny).toBeDefined();

    // Test invalid table names
    await expect(dbManager.getTransactionAny('e2e-123', 'tenant-1', '123invalid')).rejects.toThrow(
      'Invalid table name format: 123invalid. Table names must start with a letter or underscore and contain only letters, digits, and underscores (max 63 characters).',
    );

    await expect(dbManager.getTransactionAny('e2e-123', 'tenant-1', 'table-with-dashes')).rejects.toThrow(
      'Invalid table name format: table-with-dashes. Table names must start with a letter or underscore and contain only letters, digits, and underscores (max 63 characters).',
    );

    await expect(dbManager.getTransactionAny('e2e-123', 'tenant-1', 'table with spaces')).rejects.toThrow(
      'Invalid table name format: table with spaces. Table names must start with a letter or underscore and contain only letters, digits, and underscores (max 63 characters).',
    );

    dbManager.quit();
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

  it('should correctly set updDtTm and not change creDtTm in updateCondition', async () => {
    const testTypes = <RedisService & EventHistoryDB>{};
    const dbManager: typeof testTypes = globalManager satisfies EventHistoryDB;
    // Mock Date to control the current time for updDtTm
    const mockCurrentTime = '2024-02-23T15:30:45.123Z';
    const originalDate = global.Date;
    // Create a mock Date class
    const MockDate = class extends Date {
      constructor() {
        super(mockCurrentTime);
      }
      static now() {
        return new Date(mockCurrentTime).getTime();
      }
    };
    // Override toISOString to return our mock time
    MockDate.prototype.toISOString = function () {
      return mockCurrentTime;
    };
    global.Date = MockDate as any;
    const querySpy = jest.spyOn(globalManager._eventHistory, 'query');
    querySpy.mockImplementation((query: any) => Promise.resolve({ rows: [] }));
    try {
      const conditionId = 'test-condition-123';
      const expireDateTime = '2024-12-31T23:59:59.999Z';
      const tenantId = 'test-tenant-456';
      await dbManager.updateCondition(conditionId, expireDateTime, tenantId);
      expect(querySpy).toHaveBeenCalledTimes(1);
      const actualCall = querySpy.mock.calls[0][0] as any;
      expect(actualCall.text).toContain('UPDATE');
      expect(actualCall.text).toContain('condition');
      expect(actualCall.text).toContain('jsonb_set');
      expect(actualCall.text).toContain('xprtnDtTm');
      expect(actualCall.text).toContain('updDtTm');
      expect(actualCall.text).toContain('WHERE');
      expect(actualCall.text).toContain('id = $2');
      expect(actualCall.text).toContain('tenantId = $3');
      expect(actualCall.values).toHaveLength(4);
      expect(actualCall.values[0]).toBe(expireDateTime);
      expect(actualCall.values[1]).toBe(conditionId);
      expect(actualCall.values[2]).toBe(tenantId);
      expect(actualCall.values[3]).toBe(mockCurrentTime);
      expect(actualCall.text).not.toContain('creDtTm');
      expect(actualCall.text).toContain("jsonb_set(condition, '{xprtnDtTm}', to_jsonb($1::text), true)");
      expect(actualCall.text).toContain('jsonb_set(');
      expect(actualCall.text).toContain("'{updDtTm}', to_jsonb($4::text), true");
    } finally {
      global.Date = originalDate;
      querySpy.mockRestore();
    }
  });

  it('should handle different expireDateTime formats in updateCondition', async () => {
    const testTypes = <RedisService & EventHistoryDB>{};
    const dbManager: typeof testTypes = globalManager satisfies EventHistoryDB;

    const querySpy = jest.spyOn(globalManager._eventHistory, 'query');
    querySpy.mockImplementation((query: any) => Promise.resolve({ rows: [] }));

    const testCases = [
      {
        conditionId: 'condition-001',
        expireDateTime: '2024-12-31T23:59:59.999Z',
        tenantId: 'tenant-001',
        description: 'End of year expiry',
      },
      {
        conditionId: 'condition-002',
        expireDateTime: '2025-06-15T12:30:00.000Z',
        tenantId: 'tenant-002',
        description: 'Mid-year expiry',
      },
      {
        conditionId: 'condition-003',
        expireDateTime: '2024-03-01T00:00:00.000Z',
        tenantId: 'tenant-003',
        description: 'Start of month expiry',
      },
    ];

    for (const testCase of testCases) {
      await dbManager.updateCondition(testCase.conditionId, testCase.expireDateTime, testCase.tenantId);

      const lastCall = querySpy.mock.calls[querySpy.mock.calls.length - 1][0] as any;

      // Verify correct parameter values for each test case
      expect(lastCall.values[0]).toBe(testCase.expireDateTime); // expireDateTime
      expect(lastCall.values[1]).toBe(testCase.conditionId); // conditionId
      expect(lastCall.values[2]).toBe(testCase.tenantId); // tenantId
      expect(lastCall.values[3]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/); // nowDateTime (ISO format)
    }

    expect(querySpy).toHaveBeenCalledTimes(testCases.length);
    querySpy.mockClear();
  });

  it('should verify CreDtTm parameter in saveAccount function', async () => {
    const testTypes = <RedisService & EventHistoryDB>{};
    const dbManager: typeof testTypes = globalManager satisfies EventHistoryDB;

    // Mock the query method to capture the query parameters
    const querySpy = jest.spyOn(globalManager._eventHistory, 'query');
    querySpy.mockImplementation((query: any) => Promise.resolve({ rows: [] }));

    const testAccountId = 'test-account-123';
    const testTenantId = 'test-tenant-456';
    const testCreDtTm = '2024-02-20T15:45:30.123Z';

    // Call saveAccount with CreDtTm parameter
    await dbManager.saveAccount(testAccountId, testTenantId, testCreDtTm);

    // Verify the query was called with correct parameters
    expect(querySpy).toHaveBeenCalledWith({
      text: 'INSERT INTO account (id, tenantId, creDtTm) VALUES ($1, $2, $3) ON CONFLICT (id, tenantId) DO NOTHING',
      values: [testAccountId, testTenantId, testCreDtTm],
    });

    querySpy.mockClear();
  });

  it('should handle different CreDtTm formats in saveAccount', async () => {
    const testTypes = <RedisService & EventHistoryDB>{};
    const dbManager: typeof testTypes = globalManager satisfies EventHistoryDB;

    const querySpy = jest.spyOn(globalManager._eventHistory, 'query');
    querySpy.mockImplementation((query: any) => Promise.resolve({ rows: [] }));

    // Test with different timestamp formats
    const testCases = [
      {
        accountId: 'account-001',
        tenantId: 'tenant-001',
        creDtTm: '2024-02-20T10:30:00.000Z',
        description: 'ISO 8601 with milliseconds',
      },
      {
        accountId: 'account-002',
        tenantId: 'tenant-002',
        creDtTm: '2024-02-20T14:22:15.999Z',
        description: 'ISO 8601 with different milliseconds',
      },
      {
        accountId: 'account-003',
        tenantId: 'tenant-003',
        creDtTm: '2024-01-15T08:00:00.000Z',
        description: 'Different date',
      },
    ];

    for (const testCase of testCases) {
      await dbManager.saveAccount(testCase.accountId, testCase.tenantId, testCase.creDtTm);

      expect(querySpy).toHaveBeenCalledWith({
        text: 'INSERT INTO account (id, tenantId, creDtTm) VALUES ($1, $2, $3) ON CONFLICT (id, tenantId) DO NOTHING',
        values: [testCase.accountId, testCase.tenantId, testCase.creDtTm],
      });
    }

    expect(querySpy).toHaveBeenCalledTimes(testCases.length);
    querySpy.mockClear();
  });

  it('should preserve CreDtTm parameter order in saveAccount query', async () => {
    const testTypes = <RedisService & EventHistoryDB>{};
    const dbManager: typeof testTypes = globalManager satisfies EventHistoryDB;

    const querySpy = jest.spyOn(globalManager._eventHistory, 'query');
    querySpy.mockImplementation((query: any) => Promise.resolve({ rows: [] }));

    await dbManager.saveAccount('acc-id', 'tenant-id', '2024-02-20T12:00:00.000Z');

    const expectedQuery = {
      text: 'INSERT INTO account (id, tenantId, creDtTm) VALUES ($1, $2, $3) ON CONFLICT (id, tenantId) DO NOTHING',
      values: ['acc-id', 'tenant-id', '2024-02-20T12:00:00.000Z'],
    };

    expect(querySpy).toHaveBeenCalledWith(expectedQuery);

    // Verify parameter order: key, tenantId, CreDtTm
    const actualCall = querySpy.mock.calls[0][0] as any;
    expect(actualCall.values[0]).toBe('acc-id'); // key parameter (id)
    expect(actualCall.values[1]).toBe('tenant-id'); // tenantId parameter
    expect(actualCall.values[2]).toBe('2024-02-20T12:00:00.000Z'); // CreDtTm parameter

    querySpy.mockClear();
  });

  it('should correctly set updDtTm and not change creDtTm in updateCondition', async () => {
    const testTypes = <RedisService & EventHistoryDB>{};
    const dbManager: typeof testTypes = globalManager satisfies EventHistoryDB;

    // Mock Date to control the current time for updDtTm
    const mockCurrentTime = '2024-02-23T15:30:45.123Z';
    const originalDate = global.Date;

    // Create a mock Date class
    const MockDate = class extends Date {
      constructor() {
        super(mockCurrentTime);
      }

      static now() {
        return new Date(mockCurrentTime).getTime();
      }
    };

    // Override toISOString to return our mock time
    MockDate.prototype.toISOString = function () {
      return mockCurrentTime;
    };

    global.Date = MockDate as any;

    const querySpy = jest.spyOn(globalManager._eventHistory, 'query');
    querySpy.mockImplementation((query: any) => Promise.resolve({ rows: [] }));

    const conditionId = 'test-condition-123';
    const expireDateTime = '2024-12-31T23:59:59.999Z';
    const tenantId = 'test-tenant-456';

    await dbManager.updateCondition(conditionId, expireDateTime, tenantId);

    // Verify the query was called with the correct structure
    expect(querySpy).toHaveBeenCalledTimes(1);

    const actualCall = querySpy.mock.calls[0][0] as any;

    // Verify the SQL query structure
    expect(actualCall.text).toContain('UPDATE');
    expect(actualCall.text).toContain('condition');
    expect(actualCall.text).toContain('jsonb_set');
    expect(actualCall.text).toContain('xprtnDtTm');
    expect(actualCall.text).toContain('updDtTm');
    expect(actualCall.text).toContain('WHERE');
    expect(actualCall.text).toContain('id = $2');
    expect(actualCall.text).toContain('tenantId = $3');

    // Verify parameters are in the correct order: [expireDateTime, conditionId, tenantId, nowDateTime]
    expect(actualCall.values).toHaveLength(4);
    expect(actualCall.values[0]).toBe(expireDateTime); // $1 - expireDateTime for xprtnDtTm
    expect(actualCall.values[1]).toBe(conditionId); // $2 - conditionId for WHERE clause
    expect(actualCall.values[2]).toBe(tenantId); // $3 - tenantId for WHERE clause
    expect(actualCall.values[3]).toBe(mockCurrentTime); // $4 - nowDateTime for updDtTm

    // Verify that only xprtnDtTm and updDtTm are being updated, not creDtTm
    expect(actualCall.text).not.toContain('creDtTm');

    // Verify the nested jsonb_set structure for both fields
    expect(actualCall.text).toContain("jsonb_set(condition, '{xprtnDtTm}', to_jsonb($1::text), true)");
    expect(actualCall.text).toContain('jsonb_set(');
    expect(actualCall.text).toContain("'{updDtTm}', to_jsonb($4::text), true");

    // Restore original Date
    global.Date = originalDate;
    querySpy.mockClear();
  });

  it('should handle different expireDateTime formats in updateCondition', async () => {
    const testTypes = <RedisService & EventHistoryDB>{};
    const dbManager: typeof testTypes = globalManager satisfies EventHistoryDB;

    const querySpy = jest.spyOn(globalManager._eventHistory, 'query');
    querySpy.mockImplementation((query: any) => Promise.resolve({ rows: [] }));

    const testCases = [
      {
        conditionId: 'condition-001',
        expireDateTime: '2024-12-31T23:59:59.999Z',
        tenantId: 'tenant-001',
        description: 'End of year expiry',
      },
      {
        conditionId: 'condition-002',
        expireDateTime: '2025-06-15T12:30:00.000Z',
        tenantId: 'tenant-002',
        description: 'Mid-year expiry',
      },
      {
        conditionId: 'condition-003',
        expireDateTime: '2024-03-01T00:00:00.000Z',
        tenantId: 'tenant-003',
        description: 'Start of month expiry',
      },
    ];

    for (const testCase of testCases) {
      await dbManager.updateCondition(testCase.conditionId, testCase.expireDateTime, testCase.tenantId);

      const lastCall = querySpy.mock.calls[querySpy.mock.calls.length - 1][0] as any;

      // Verify correct parameter values for each test case
      expect(lastCall.values[0]).toBe(testCase.expireDateTime); // expireDateTime
      expect(lastCall.values[1]).toBe(testCase.conditionId); // conditionId
      expect(lastCall.values[2]).toBe(testCase.tenantId); // tenantId
      expect(lastCall.values[3]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/); // nowDateTime (ISO format)
    }

    expect(querySpy).toHaveBeenCalledTimes(testCases.length);
    querySpy.mockClear();
  });
});
