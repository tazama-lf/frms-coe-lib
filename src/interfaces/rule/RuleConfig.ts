export interface RuleConfig {
  _key: string;
  _id: string;
  _rev: string;
  id: string;
  cfg: string;
  config: Config;
  desc: string;
}

export interface Config {
  timeframes: Timeframe[];
  bands: Band[];
}

export interface Timeframe {
  threshold: number;
}

export interface Band {
  subRuleRef: string;
  lowerLimit?: number;
  outcome: boolean;
  reason: string;
  upperLimit?: number;
}
