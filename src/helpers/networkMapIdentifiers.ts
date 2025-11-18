// SPDX-License-Identifier: Apache-2.0

import type { DatabaseManagerInstance, ManagerConfig } from '..';
import type { NetworkMap } from '../interfaces';

function getRuleMap(networkMap: NetworkMap): { rulesIds: string[]; typologyCfg: string[] } {
  const rulesIds: string[] = new Array<string>();
  const typologyCfg: string[] = new Array<string>();

  for (const Message of networkMap.messages) {
    for (const typology of Message.typologies) {
      if (!typologyCfg.includes(typology.cfg)) typologyCfg.push(typology.cfg);
      for (const rule of typology.rules) {
        if (!rulesIds.includes(rule.id)) rulesIds.push(rule.id);
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
  const networkMaps = await databaseManager.getNetworkMap();

  for (const networkMap of networkMaps) {
    const ruleMaps = getRuleMap(networkMap);
    ruleIds = [...ruleIds, ...ruleMaps.rulesIds];
    typologyCfg = [...typologyCfg, ...ruleMaps.typologyCfg];
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
