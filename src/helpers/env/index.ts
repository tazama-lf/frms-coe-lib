/**
 * Validates and retrieves the specified environment variable.
 *
 * @template T - The expected type of the environment variable.
 * @param {string} name - The name of the environment variable to validate.
 * @param {'string' | 'number' | 'boolean'} type - The expected type of the environment variable.
 * @returns {T} - The value of the environment variable, cast to the specified type.
 * @throws {Error} - Throws an error if the environment variable is not defined, or if the value cannot be converted to the specified type.
 *
 * @example
 * const port = validateEnvVar<number>('PORT', 'number');
 * const env = validateEnvVar<string>('NODE_ENV', 'string');
 * const apiKey = validateEnvVar<string>('API_KEY', 'string');
 */
export function validateEnvVar<T>(name: string, type: 'string' | 'number' | 'boolean'): T {
  const value = process.env[name];

  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not defined.`);
  }

  let numValue;

  switch (type) {
    case 'string':
      return value as T;
    case 'number':
      numValue = Number(value);
      if (isNaN(numValue)) {
        throw new Error(`Environment variable ${name} is not a valid number.`);
      }
      return numValue as T;
    case 'boolean':
      if (value.toLowerCase() === 'true') {
        return true as T;
      } else if (value.toLowerCase() === 'false') {
        return false as T;
      }
      throw new Error(`Environment variable ${name} is not a valid boolean.`);
    default:
      throw new Error('Unsupported type');
  }
}
