/* eslint-disable @typescript-eslint/no-explicit-any */
import { NetworkMapSample } from '../data';

export const DatabaseNetworkMapMocks = (databaseManager: any): void => {
  jest.spyOn(databaseManager, 'getNetworkMap').mockImplementation(async () => {
    return await Promise.resolve(NetworkMapSample);
  });
};
