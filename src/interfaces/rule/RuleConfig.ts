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
  case?: Case[];
  timeframes?: Timeframe[];
}

export interface OutcomeResult {
  subRuleRef: string;
  /**
   * @deprecated
   */
  outcome: boolean;
  reason: string;
}

export interface Band extends OutcomeResult {
  lowerLimit?: number;
  upperLimit?: number;
}

export interface Case extends OutcomeResult {
  value: number;
}

export interface Timeframe {
  threshold: number;
}
