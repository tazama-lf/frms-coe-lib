/**
 * Validates and retrieves the specified environment variable.
 *
 * @param {string} name - The name of the environment variable to validate.
 * @param {'string' | 'number' | 'boolean'} type - The expected type of the environment variable.
 * @param {boolean} optional - Is this variable optional (Defaults to false)
 * @returns {'string' | 'number' | 'boolean'} - The value of the environment variable, cast to the specified type.
 * @throws {Error} - Throws an error if the environment variable is not defined, or if the value cannot be converted to the specified type.
 *
 * @example
 * const port = validateEnvVar('PORT', 'number');
 * const env = validateEnvVar('NODE_ENV', 'string');
 * const apiKey = validateEnvVar('API_KEY', 'string', true);
 */
export function validateEnvVar(name: string, type: 'string' | 'number' | 'boolean', optional = false): string | number | boolean {
  const value = process.env[name] ?? '';

  if (value === '' && optional) {
    return '';
  }

  if (value === '') {
    throw new Error(`Environment variable ${name} is not defined.`);
  }

  if (value && !value.trim().length && optional) {
    throw new Error(`Environment variable ${name} is optional but set to a string with whitespaces only. Consider removing it.`);
  }

  switch (type) {
    case 'string':
      return value;
    case 'number':
      if (isNaN(Number(value))) {
        throw new Error(`Environment variable ${name} is not a valid number.`);
      }
      return Number(value);
    case 'boolean':
      if (value.toLowerCase() === 'true') {
        return true;
      } else if (value.toLowerCase() === 'false') {
        return false;
      }
      throw new Error(`Environment variable ${name} is not a valid boolean.`);
  }
}

/**
 * Validates and retrieves the `FUNCTION_NAME` environment variable, failing fast when it contains a `/`.
 *
 * The `/`-free invariant keeps the composed service-channel `source`
 * (`${SERVICE_CHANNEL_SOURCE_URI_PREFIX}${FUNCTION_NAME}`) safely recoverable as the trailing path
 * segment. Dots stay legal (versioned names such as `typology-001@1.0.0`); this is not a broader
 * NATS-charset check.
 *
 * @returns {string} - The validated `/`-free function name.
 * @throws {Error} - If `FUNCTION_NAME` is not defined, or contains a `/`.
 */
export function validateFunctionName(): string {
  const functionName = validateEnvVar('FUNCTION_NAME', 'string').toString();

  if (functionName.includes('/')) {
    throw new Error('Environment variable FUNCTION_NAME must not contain a path separator (/).');
  }

  return functionName;
}
