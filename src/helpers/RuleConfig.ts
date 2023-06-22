import type { RuleConfig } from '../interfaces';
export const getReadableDescription = (ruleConfig: Pick<RuleConfig, 'desc'>): string => {
  return ruleConfig.desc?.trim().length ? ruleConfig.desc : 'No description provided in rule config.';
};
