/* eslint-disable @typescript-eslint/no-explicit-any */

import { type DatabaseManagerInstance, type ManagerConfig } from '..';
import { type NetworkMap } from '../interfaces';
import { unwrap } from './unwrap';

function getRuleMap(networkMap: NetworkMap | undefined): { rulesIds: string[]; typologyCfg: string[] } {
  const rulesIds: string[] = new Array<string>();
  const typologyCfg: string[] = new Array<string>();
  if (networkMap)
    for (const Message of networkMap.messages) {
      if (Message.channels?.length)
        for (const channel of Message.channels) {
          if (channel.typologies?.length)
            for (const typology of channel.typologies) {
              if (!typologyCfg.includes(typology.cfg)) typologyCfg.push(typology.cfg);
              if (typology.rules?.length)
                for (const rule of typology.rules) {
                  if (!rulesIds.includes(rule.id)) rulesIds.push(rule.id);
                }
            }
        }
    }
  return { rulesIds, typologyCfg };
}

export const getIdsFromNetworkMap = async (
  databaseManager: DatabaseManagerInstance<ManagerConfig>,
): Promise<{ rulesIds: string[]; typologyCfg: string[] }> => {
  const networkConfigurationList = await databaseManager.getNetworkMap();
  const unwrappedNetworkMap = unwrap<NetworkMap>(networkConfigurationList as NetworkMap[][]);
  const networkMap = getRuleMap(unwrappedNetworkMap);
  return {
    rulesIds: networkMap.rulesIds,
    typologyCfg: networkMap.typologyCfg,
  };
};

export const getRoutesFromNetworkMap = async (
  databaseManager: DatabaseManagerInstance<ManagerConfig>,
  processor: string,
): Promise<{ consumers: string[] }> => {
  const { typologyCfg, rulesIds } = await getIdsFromNetworkMap(databaseManager);

  switch (processor) {
    case 'typology-processor':
      return {
        consumers: rulesIds.map((eachRuleId) => 'pub-rule-' + eachRuleId),
      };
    case 'transaction-aggregation-decisioning-processor':
      return {
        consumers: typologyCfg.map((eachTypologyCfg) => 'typology-' + eachTypologyCfg),
      };
    default:
      return { consumers: [''] };
  }
};
