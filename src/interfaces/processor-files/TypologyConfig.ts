import { type WorkFlow } from './TypologyResult';

// SPDX-License-Identifier: Apache-2.0
export interface IRuleValue {
  id: string;
  cfg: string;
  wghts: IWeight[];
  termId: string;
}

export interface IWeight {
  ref: string;
  wght: number;
}

export interface IRule {
  id: string;
  cfg: string;
  ref?: string;
}

export type ExpressionMathJSON = Array<string | number | ExpressionMathJSON>;

export interface ITypologyExpression {
  id: string;
  cfg: string;
  desc?: string;
  rules: IRuleValue[];
  expression: ExpressionMathJSON;
  workflow: WorkFlow;
}
