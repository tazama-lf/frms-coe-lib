export interface RuleResult {
  id: string;
  cfg: string;
  result: boolean;
  subRuleRef: string;
  reason: string;
  desc: string;
  pcrgTm?: string;
}
