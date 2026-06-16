// SPDX-License-Identifier: Apache-2.0

import { validateFunctionName } from '../src/config/environment';
import { validateProcessorConfig } from '../src/config/processor.config';

describe('validateFunctionName (AC#6)', () => {
  afterEach(() => {
    delete process.env.FUNCTION_NAME;
  });

  test('throws when FUNCTION_NAME is not defined (delegates to validateEnvVar)', () => {
    delete process.env.FUNCTION_NAME;
    expect(() => validateFunctionName()).toThrow(Error);
  });

  test('returns the value when FUNCTION_NAME is "/"-free', () => {
    process.env.FUNCTION_NAME = 'event-director';
    expect(validateFunctionName()).toBe('event-director');
  });

  test('accepts dotted / versioned names (dots stay legal)', () => {
    process.env.FUNCTION_NAME = 'typology-001@1.0.0';
    expect(validateFunctionName()).toBe('typology-001@1.0.0');
  });

  test('throws when FUNCTION_NAME contains a "/"', () => {
    process.env.FUNCTION_NAME = 'foo/bar';
    expect(() => validateFunctionName()).toThrow(/FUNCTION_NAME/);
  });
});

describe('validateProcessorConfig fails fast on a "/"-containing FUNCTION_NAME (AC#6)', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.MAX_CPU = '1';
  });

  afterAll(() => {
    delete process.env.NODE_ENV;
    delete process.env.MAX_CPU;
  });

  afterEach(() => {
    delete process.env.FUNCTION_NAME;
  });

  test('throws when FUNCTION_NAME contains a "/"', () => {
    process.env.FUNCTION_NAME = 'some/processor';
    expect(() => validateProcessorConfig()).toThrow();
  });

  test('passes through for a "/"-free FUNCTION_NAME', () => {
    process.env.FUNCTION_NAME = 'event-director';
    expect(() => validateProcessorConfig()).not.toThrow();
  });
});
