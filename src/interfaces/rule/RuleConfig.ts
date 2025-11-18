// SPDX-License-Identifier: Apache-2.0

export interface RuleConfig {
  id: string;
  cfg: string;
  config: Config;
  tenantId: string;
  desc?: string;
}

export interface Config {
  parameters?: Record<string | number, unknown>;
  exitConditions?: OutcomeResult[];
  bands?: Band[];
  cases?: Case;
  timeframes?: Timeframe[];
}

export interface OutcomeResult {
  subRuleRef: string;
  reason: string;
}

export interface Band extends OutcomeResult {
  lowerLimit?: number;
  upperLimit?: number;
}

export interface Case {
  expressions: Expression[];
  alternative: OutcomeResult;
}

export interface Timeframe {
  threshold: number;
}

export interface Expression extends OutcomeResult {
  value: string;
}
