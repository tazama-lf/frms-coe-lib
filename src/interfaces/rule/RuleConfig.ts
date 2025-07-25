// SPDX-License-Identifier: Apache-2.0

export interface RuleConfig {
  _key?: string;
  _id?: string;
  _rev?: string;
  id: string;
  cfg: string;
  config: Config;
  desc?: string;
}

export interface Config {
  parameters?: Record<string | number, unknown>;
  exitConditions?: OutcomeResult[];
  bands?: Band[];
  cases?: Case[];
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

export interface Case extends OutcomeResult {
  value: string;
}

export interface Timeframe {
  threshold: number;
}
