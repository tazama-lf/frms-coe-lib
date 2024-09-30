import { validateEnvVar } from '.';

export interface NatsConfig {
  serverUrl: string;
  publishTo?: string;
  subscribeTo?: string;
}

export const validateNATSConfig = (publisher: boolean, subscriber: boolean): NatsConfig => {
  let publishTo: string | undefined;
  let subscribeTo: string | undefined;

  if (publisher) {
    publishTo = validateEnvVar('NATS_PUBLISH_TO', 'string');
  }

  if (subscriber) {
    subscribeTo = validateEnvVar('NATS_SUBSCRIBE_TO', 'string');
  }

  return {
    serverUrl: validateEnvVar('NATS_SERVER_URL', 'string'),
    publishTo,
    subscribeTo,
  };
};
