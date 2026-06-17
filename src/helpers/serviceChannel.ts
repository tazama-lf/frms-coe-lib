// SPDX-License-Identifier: Apache-2.0

import { CloudEvent } from 'cloudevents';
import type { ServiceChannelAudienceClass, ServiceChannelKind } from '../interfaces';

/**
 * The shared service-channel `type` verb enum (CC-C13): reverse-DNS, past-tense, constant across all
 * deployments. The `org.tazama` prefix names the project that defines the semantics; the deployer's
 * domain lives in `source`, never here.
 *
 * `org.tazama.network-map.deactivated` is deferred from the MVP verb set (an emergency kill-switch);
 * it is promoted additively only if it must notify consumers.
 */
export const ServiceChannelType = {
  NETWORK_MAP_ACTIVATED: 'org.tazama.network-map.activated',
} as const;

export type ServiceChannelType = (typeof ServiceChannelType)[keyof typeof ServiceChannelType];

/**
 * The `kind` map keyed by the `type` verb (CC-C09). Constrained to `'event' | 'command'`: `ack` is
 * structurally impossible as a map value because an ack reuses the triggering message's `type` and is
 * instead derived from the reply subject.
 */
export const serviceChannelKind: Record<ServiceChannelType, Exclude<ServiceChannelKind, 'ack'>> = {
  [ServiceChannelType.NETWORK_MAP_ACTIVATED]: 'event',
};

/**
 * Construction-time properties for a service-channel CloudEvent, parameterised on the `data` payload `T`.
 * The generic `T` is compile-time only and is never runtime-checked against `data`.
 */
export interface ServiceChannelEventProps<T> {
  type: ServiceChannelType;
  source: string;
  data?: T;
  subject?: string;
  id?: string;
  time?: string;
  datacontenttype?: string;
}

/**
 * Thin generic wrapper over the `cloudevents` SDK so every participant constructs identically.
 * Defaults `datacontenttype` to `application/json` (the structured-mode profile) and lets the SDK
 * generate a fresh `id`. The SDK validates the envelope on build (strict mode) and throws on a
 * malformed envelope.
 */
export const construct = <T>(props: ServiceChannelEventProps<T>): CloudEvent<T> =>
  new CloudEvent<T>({ datacontenttype: 'application/json', ...props });

/**
 * Pass-through to the SDK's non-generic, envelope-only `validate()` for a re-check at the consumer
 * deserialize boundary. The SDK has no `validate<T>()`; `data` shape is never runtime-checked here.
 */
export const validateEnvelope = <T>(event: CloudEvent<T>): boolean => event.validate();

/**
 * The symmetric decode counterpart to `construct<T>()`: reconstructs a `CloudEvent<T>` from the
 * structured-mode JSON bytes a producer puts on the wire (`TextEncoder().encode(JSON.stringify(event))`).
 * The SDK validates the envelope on construction (strict mode) and throws on malformed bytes or a
 * malformed envelope. The generic `T` is compile-time only; `data` shape is never runtime-checked.
 */
export const deserialize = <T>(bytes: Uint8Array): CloudEvent<T> =>
  new CloudEvent<T>(JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>);

/**
 * The fixed class/broadcast addressing tokens owned by the contract (`all` = broadcast). The open
 * processor-name space is deployment-defined and intentionally not enumerated.
 */
export const SERVICE_CHANNEL_AUDIENCE = {
  EVENT_DIRECTOR: 'event-director',
  TYPOLOGY_PROCESSOR: 'typology-processor',
  RULE_PROCESSOR: 'rule-processor',
  EVENT_ADJUDICATOR: 'event-adjudicator',
  ALL: 'all',
} as const satisfies Record<string, ServiceChannelAudienceClass>;

/** A participant's self-identity, supplied from its own deploy-time environment. */
export interface ServiceChannelIdentity {
  class: ServiceChannelAudienceClass;
  functionName: string;
}

/**
 * The single, drift-proof audience gate: a participant acts iff `audience` is absent, `all`, its own
 * class token, or its own (free-form) processor name. The contract supplies the vocabulary; each
 * consumer supplies its identity.
 */
export const inAudience = (audience: string | undefined, identity: ServiceChannelIdentity): boolean => {
  if (audience === undefined || audience === SERVICE_CHANNEL_AUDIENCE.ALL) {
    return true;
  }
  return audience === identity.class || audience === identity.functionName;
};
