import { validateEnvVar } from '../src/helpers/env';

describe('Environment Variables', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'production';
    process.env.MAX_CPU = '2';
  });

  afterAll(() => {
    delete process.env.NODE_ENV;
  });

  test('should check for specified unavailable variable', () => {
    delete process.env.TEST_VAR;
    expect(() => validateEnvVar('TEST_VAR', 'string')).toThrow(Error);
  });

  test('should check for specified variable', () => {
    process.env.TEST_VAR = 'some value';

    let validated = validateEnvVar('TEST_VAR', 'string');

    expect(validated).toBe('some value');

    delete process.env.TEST_VAR;
  });
});
