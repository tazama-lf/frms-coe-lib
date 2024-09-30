import { validateEnvVar } from '.';

export interface ApmConfig {
  apmActive: boolean;
  apmServiceName: string;
  apmUrl: string;
  apmSecretToken: string;
}

export interface LogConfig {
  sidecarHost: string;
}

export const validateAPMConfig = (): ApmConfig => {
  return {
    apmActive: validateEnvVar('APM_ACTIVE', 'boolean'),
    apmServiceName: validateEnvVar('APM_SERVICE_NAME', 'string'),
    apmSecretToken: validateEnvVar('APM_SECRET_TOKEN', 'string'),
    apmUrl: validateEnvVar('APM_URL', 'string'),
  };
};

export const validateLogConfig = (): LogConfig => {
  return {
    sidecarHost: validateEnvVar('SIDECAR_HOST', 'string'),
  };
};
