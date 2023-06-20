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
  exitConditions?: Array<Pick<Band, 'subRuleRef' | 'outcome' | 'reason'>>;
  bands: Band[];
  timeframes?: Timeframe[];
}

export interface Band {
  subRuleRef: string;
  lowerLimit?: number;
  outcome: boolean;
  reason: string;
  upperLimit?: number;
}

export interface Timeframe {
  threshold: number;
}
