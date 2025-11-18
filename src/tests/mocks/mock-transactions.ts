// SPDX-License-Identifier: Apache-2.0

import { NetworkMapSample } from '../data';
import { Pacs008Sample } from '../data/pacs008';

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

  jest.spyOn(cacheDatabaseClient, 'saveTransactionDetails').mockImplementation(async () => {
    await Promise.resolve();
  });

  jest.spyOn(cacheDatabaseClient, 'saveTransactionHistory').mockImplementation(async () => {
    await Promise.resolve();
  });
};

export const DatabaseManagerMocks = (databaseManager: any, cacheString?: any): void => {
  // Database raw History Mocks
  if (databaseManager.isReadyCheck()?.rawHistory === 'Ok') {
    jest.spyOn(databaseManager, 'getTransactionPacs008').mockImplementation(async (event: any) => await Promise.resolve([[Pacs008Sample]]));
  }

  // Database Network Map Mocks
  if (databaseManager.isReadyCheck()?.networkMap === 'Ok') {
    jest.spyOn(databaseManager, 'getNetworkMap').mockImplementation(async () => await Promise.resolve(NetworkMapSample));
  }

  if (databaseManager.isReadyCheck()?.configuration === 'Ok') {
    jest.spyOn(databaseManager, 'getNetworkMap').mockImplementation(async () => await Promise.resolve(NetworkMapSample));
  }

  // Redis Mocks
  if (databaseManager.isReadyCheck()?.Redis === 'Ok') {
    jest.spyOn(databaseManager, 'setJson').mockImplementation(async (): Promise<any> => {
      await Promise.resolve();
    });
  }
};
