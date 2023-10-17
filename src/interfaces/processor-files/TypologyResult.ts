import { type RuleResult } from '..';

export class TypologyResult {
  id = '';
  cfg = '';
  prcgTm? = 0;
  result = 0.0;
  threshold = 0.0;
  review? = false;
  ruleResults: RuleResult[] = [];
  workflow : WorkFlow = new WorkFlow();
}

export class WorkFlow {
  alertThreshold = '';
  interdictionThreshold = '';
}
