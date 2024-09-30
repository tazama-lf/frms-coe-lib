import { validateEnvVar } from '.';

export interface RedisConfig {
  db: string;
  auth?: string;
  servers: string;
  isCluster: boolean;
}

export const validateRedisConfig = (authEnabled: boolean): RedisConfig => {
  let auth: string | undefined;

  if (authEnabled) {
    auth = validateEnvVar('REDIS_AUTH', 'string');
  }

  return {
    db: validateEnvVar('REDIS_DATABASE', 'string'),
    auth,
    servers: validateEnvVar('REDIS_SERVERS', 'string'),
    isCluster: validateEnvVar('REDIS_IS_CLUSTER', 'boolean'),
  };
};
