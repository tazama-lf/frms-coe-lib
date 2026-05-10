// SPDX-License-Identifier: Apache-2.0
import {
  baseRuleConfigSchema,
  BandSchema,
  OutcomeResultSchema,
  ExpressionSchema,
  CaseSchema,
  TimeframeSchema,
  baseConfigSchema,
} from '../src/schemas/ruleConfig';

const validConfig = {
  id: '901@1.0.0',
  cfg: '1.0.0',
  tenantId: 'DEFAULT',
  config: {},
};

describe('baseRuleConfigSchema', () => {
  it('should accept a minimal valid RuleConfig', () => {
    expect(() => baseRuleConfigSchema.parse(validConfig)).not.toThrow();
  });

  it('should accept a fully populated RuleConfig', () => {
    const full = {
      ...validConfig,
      desc: 'Test rule',
      creDtTm: '2024-01-01T00:00:00.000Z',
      updDtTm: '2024-01-02T00:00:00.000Z',
      config: {
        parameters: { maxQueryRange: 86400000 },
        exitConditions: [{ subRuleRef: '.x00', reason: 'Unsuccessful transaction' }],
        bands: [
          { subRuleRef: '.01', reason: 'Low', upperLimit: 10 },
          { subRuleRef: '.02', reason: 'High', lowerLimit: 10 },
        ],
        timeframes: [{ threshold: 3600 }],
      },
    };
    expect(() => baseRuleConfigSchema.parse(full)).not.toThrow();
  });

  it('should reject when id is missing', () => {
    const { id: _id, ...noId } = validConfig;
    expect(() => baseRuleConfigSchema.parse(noId)).toThrow();
  });

  it('should reject when cfg is missing', () => {
    const { cfg: _cfg, ...noCfg } = validConfig;
    expect(() => baseRuleConfigSchema.parse(noCfg)).toThrow();
  });

  it('should reject when tenantId is missing', () => {
    const { tenantId: _t, ...noTenant } = validConfig;
    expect(() => baseRuleConfigSchema.parse(noTenant)).toThrow();
  });

  it('should reject when config is missing', () => {
    const { config: _c, ...noConfig } = validConfig;
    expect(() => baseRuleConfigSchema.parse(noConfig)).toThrow();
  });

  it('should accept config with all optional fields absent', () => {
    const result = baseRuleConfigSchema.parse({ ...validConfig, config: {} });
    expect(result.config).toEqual({});
  });
});

describe('OutcomeResultSchema', () => {
  it('should accept valid outcome result', () => {
    expect(() => OutcomeResultSchema.parse({ subRuleRef: '.x00', reason: 'Exit' })).not.toThrow();
  });

  it('should reject when subRuleRef is missing', () => {
    expect(() => OutcomeResultSchema.parse({ reason: 'Exit' })).toThrow();
  });

  it('should reject when reason is missing', () => {
    expect(() => OutcomeResultSchema.parse({ subRuleRef: '.x00' })).toThrow();
  });
});

describe('BandSchema', () => {
  it('should accept a band with only required fields', () => {
    expect(() => BandSchema.parse({ subRuleRef: '.01', reason: 'Low' })).not.toThrow();
  });

  it('should accept a band with limits', () => {
    expect(() => BandSchema.parse({ subRuleRef: '.01', reason: 'Low', lowerLimit: 0, upperLimit: 100 })).not.toThrow();
  });

  it('should reject non-numeric limits', () => {
    expect(() => BandSchema.parse({ subRuleRef: '.01', reason: 'Low', lowerLimit: 'ten' })).toThrow();
  });
});

describe('ExpressionSchema', () => {
  it('should accept valid expression', () => {
    expect(() => ExpressionSchema.parse({ subRuleRef: '.01', reason: 'Match', value: 'ACCC' })).not.toThrow();
  });

  it('should reject when value is missing', () => {
    expect(() => ExpressionSchema.parse({ subRuleRef: '.01', reason: 'Match' })).toThrow();
  });
});

describe('CaseSchema', () => {
  it('should accept valid case', () => {
    expect(() =>
      CaseSchema.parse({
        expressions: [{ subRuleRef: '.01', reason: 'Match', value: 'ACCC' }],
        alternative: { subRuleRef: '.00', reason: 'No match' },
      }),
    ).not.toThrow();
  });

  it('should accept case with empty expressions array', () => {
    expect(() => CaseSchema.parse({ expressions: [], alternative: { subRuleRef: '.00', reason: 'No match' } })).not.toThrow();
  });

  it('should reject when alternative is missing', () => {
    expect(() => CaseSchema.parse({ expressions: [] })).toThrow();
  });
});

describe('TimeframeSchema', () => {
  it('should accept valid timeframe', () => {
    expect(() => TimeframeSchema.parse({ threshold: 3600 })).not.toThrow();
  });

  it('should reject non-numeric threshold', () => {
    expect(() => TimeframeSchema.parse({ threshold: 'one hour' })).toThrow();
  });

  it('should reject missing threshold', () => {
    expect(() => TimeframeSchema.parse({})).toThrow();
  });
});

describe('baseConfigSchema', () => {
  it('should accept empty config', () => {
    expect(() => baseConfigSchema.parse({})).not.toThrow();
  });

  it('should accept all optional fields populated', () => {
    expect(() =>
      baseConfigSchema.parse({
        parameters: { maxQueryRange: 86400000 },
        exitConditions: [{ subRuleRef: '.x00', reason: 'Exit' }],
        bands: [{ subRuleRef: '.01', reason: 'Low', upperLimit: 10 }],
        cases: { expressions: [], alternative: { subRuleRef: '.00', reason: 'Default' } },
        timeframes: [{ threshold: 3600 }],
      }),
    ).not.toThrow();
  });

  it('should reject malformed bands entry', () => {
    expect(() => baseConfigSchema.parse({ bands: [{ notAField: true }] })).toThrow();
  });
});
