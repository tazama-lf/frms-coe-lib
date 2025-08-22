// SPDX-License-Identifier: Apache-2.0

import type { RuleResult } from '..';

export interface TypologyResult {
  id: string;
  cfg: string;
  prcgTm?: number;
  result: number;
  review?: boolean;
  ruleResults: RuleResult[];
  workflow: WorkFlow;
}

export interface WorkFlow {
  alertThreshold: number;
  interdictionThreshold?: number;
  flowProcessor?: string;
}
