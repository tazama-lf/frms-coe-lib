import { Pacs008Sample } from '../data/pacs008';
import { Pain001Sample } from '../data/pain001';
import { NetworkMapSample } from '../data';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const CacheDatabaseClientMocks = (cacheDatabaseClient: any): any => {
  jest.spyOn(cacheDatabaseClient, 'addAccount').mockImplementation(async () => {
    await Promise.resolve();
  });

  jest.spyOn(cacheDatabaseClient, 'addEntity').mockImplementation(async () => {
    await Promise.resolve();
  });

  jest.spyOn(cacheDatabaseClient, 'addAccountHolder').mockImplementation(async () => {
    await Promise.resolve();
  });

  jest.spyOn(cacheDatabaseClient, 'saveTransactionRelationship').mockImplementation(async () => {
    await Promise.resolve();
  });

  jest.spyOn(cacheDatabaseClient, 'saveTransactionHistory').mockImplementation(async () => {
    await Promise.resolve();
  });
};

export const DatabaseManagerMocks = (databaseManager: any, cacheString?: any): void => {
  // Arango Database Transaction History Mocks
  if (databaseManager.isReadyCheck()?.transactionHistory === 'Ok') {
    jest.spyOn(databaseManager, 'getTransactionPain001').mockImplementation(async () => {
      return await Promise.resolve([[Pain001Sample]]);
    });

    jest.spyOn(databaseManager, 'getTransactionPacs008').mockImplementation(async (pseudonym: any) => {
      return await Promise.resolve([[Pacs008Sample]]);
    });
  }

  // Arango Database Network Map Mocks
  if (databaseManager.isReadyCheck()?.networkMap === 'Ok') {
    jest.spyOn(databaseManager, 'getNetworkMap').mockImplementation(async () => {
      return await Promise.resolve(NetworkMapSample);
    });
  }

  if (databaseManager.isReadyCheck()?.configuration === 'Ok') {
    jest.spyOn(databaseManager, 'getNetworkMap').mockImplementation(async () => {
      return await Promise.resolve(NetworkMapSample);
    });
  }

  // Redis Mocks
  if (databaseManager.isReadyCheck()?.Redis === 'Ok') {
    jest.spyOn(databaseManager, 'setJson').mockImplementation(async (): Promise<any> => {
      await Promise.resolve();
    });
  }
};
