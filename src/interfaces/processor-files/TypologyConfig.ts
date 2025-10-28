import type { WorkFlow } from './TypologyResult';

// SPDX-License-Identifier: Apache-2.0

export interface TypologyConfig {
  id: string;
  cfg: string;
  desc?: string;
  rules: TypologyRuleConfig[];
  expression: ExpressionMathJSON;
  tenantId: string;
  workflow: WorkFlow;
}
export interface TypologyRuleConfig {
  id: string;
  cfg: string;
  wghts: RuleWeight[];
  termId: string;
}

export type ExpressionMathJSON = Array<string | number | ExpressionMathJSON>;

export interface RuleWeight {
  ref: string;
  wght: number;
}
