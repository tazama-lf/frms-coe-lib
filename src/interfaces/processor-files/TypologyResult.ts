// SPDX-License-Identifier: Apache-2.0

import { type RuleResult } from '..';

export class TypologyResult {
  id = '';
  cfg = '';
  prcgTm? = 0;
  result = 0.0;
  review? = false;
  ruleResults: RuleResult[] = [];
  workflow: WorkFlow = new WorkFlow();
}

export class WorkFlow {
  alertThreshold = 0;
  interdictionThreshold? = 0;
  flowProcessor?: string;
}
