// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

export const OutcomeResultSchema = z.object({
  subRuleRef: z.string(),
  reason: z.string(),
});

export const BandSchema = OutcomeResultSchema.extend({
  lowerLimit: z.number().optional(),
  upperLimit: z.number().optional(),
});

export const ExpressionSchema = OutcomeResultSchema.extend({
  value: z.string(),
});

export const CaseSchema = z.object({
  expressions: z.array(ExpressionSchema),
  alternative: OutcomeResultSchema,
});

export const baseConfigSchema = z.object({
  parameters: z.record(z.union([z.string(), z.number()]), z.unknown()).optional(),
  exitConditions: z.array(OutcomeResultSchema).optional(),
  bands: z.array(BandSchema).optional(),
  cases: CaseSchema.optional(),
});

export const baseRuleConfigSchema = z.object({
  id: z.string(),
  cfg: z.string(),
  tenantId: z.string(),
  desc: z.string().optional(),
  creDtTm: z.string().optional(),
  updDtTm: z.string().optional(),
  config: baseConfigSchema,
});
