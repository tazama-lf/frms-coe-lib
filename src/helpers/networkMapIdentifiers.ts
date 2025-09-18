// SPDX-License-Identifier: Apache-2.0

import type { DatabaseManagerInstance, ManagerConfig } from '..';
import type { NetworkMap } from '../interfaces';

function getRuleMap(networkMap: NetworkMap | undefined): { rulesIds: string[]; typologyCfg: string[] } {
  const rulesIds: string[] = new Array<string>();
  const typologyCfg: string[] = new Array<string>();
  if (networkMap) {
    for (const Message of networkMap.messages) {
      if (Message.typologies?.length) {
        for (const typology of Message.typologies) {
          if (!typologyCfg.includes(typology.cfg)) typologyCfg.push(typology.cfg);
          if (typology.rules?.length) {
            for (const rule of typology.rules) {
              if (!rulesIds.includes(rule.id)) rulesIds.push(rule.id);
            }
          }
        }
      }
    }
  }
  return { rulesIds, typologyCfg };
}

export const getIdsFromNetworkMaps = async (
  databaseManager: DatabaseManagerInstance<Required<Pick<ManagerConfig, 'configuration' | 'localCacheConfig' | 'redisConfig'>>>,
): Promise<{ rulesIds: string[]; typologyCfg: string[] }> => {
  let ruleIds: string[] = [];
  let typologyCfg: string[] = [];
  const networkConfigurationList = (await databaseManager.getNetworkMap()) as NetworkMap[][];
  for (const networkMaps of networkConfigurationList) {
    for (const networkMap of networkMaps) {
      const ruleMaps = getRuleMap(networkMap);
      ruleIds = [...ruleIds, ...ruleMaps.rulesIds];
      typologyCfg = [...typologyCfg, ...ruleMaps.typologyCfg];
    }
  }

  return {
    rulesIds: ruleIds,
    typologyCfg,
  };
};

export const getRoutesFromNetworkMap = async (
  databaseManager: DatabaseManagerInstance<Required<Pick<ManagerConfig, 'configuration' | 'localCacheConfig' | 'redisConfig'>>>,
  processor: string,
): Promise<{ consumers: string[] }> => {
  const { typologyCfg, rulesIds } = await getIdsFromNetworkMaps(databaseManager);

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
