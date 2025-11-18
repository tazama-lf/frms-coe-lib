import type { RuleConfig, RuleResult } from '../../interfaces';

export function determineOutcome(value: number, ruleConfig: RuleConfig, ruleResult: RuleResult): RuleResult {
  const { bands } = ruleConfig.config;
  if (bands && (value || value === 0)) {
    for (const band of bands) {
      if ((!band.lowerLimit || value >= band.lowerLimit) && (!band.upperLimit || value < band.upperLimit)) {
        ruleResult.subRuleRef = band.subRuleRef;
        ruleResult.reason = band.reason;
        break;
      }
    }
  } else throw new Error('Value provided undefined, so cannot determine rule outcome');
  return ruleResult;
}
