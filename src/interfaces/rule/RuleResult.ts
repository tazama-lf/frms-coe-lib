// SPDX-License-Identifier: Apache-2.0

export interface RuleResult {
  id: string;
  cfg: string;
  subRuleRef: string;
  tenantId: string;
  indpdntVarbl: number;
  reason?: string;
  prcgTm?: number;
  wght?: number;
}
