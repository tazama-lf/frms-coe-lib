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
