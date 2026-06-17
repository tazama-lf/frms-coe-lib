// SPDX-License-Identifier: Apache-2.0

import { CloudEvent } from 'cloudevents';
import { deserialize as deserializeFromBarrel } from '../src';
import {
  ServiceChannelType,
  serviceChannelKind,
  construct,
  validateEnvelope,
  deserialize,
  SERVICE_CHANNEL_AUDIENCE,
  inAudience,
} from '../src/helpers/serviceChannel';
import type { NetworkMapActivatedData, ServiceChannelAck, ServiceChannelKind, ServiceChannelAudienceClass } from '../src/interfaces';

describe('service-channel contract', () => {
  describe('type verb enum (AC#2 / CC-C13)', () => {
    test('carries the reverse-DNS network-map.activated verb constant', () => {
      expect(ServiceChannelType.NETWORK_MAP_ACTIVATED).toBe('org.tazama.network-map.activated');
    });

    test('does NOT ship the deferred deactivated verb in the MVP', () => {
      expect(Object.values(ServiceChannelType)).not.toContain('org.tazama.network-map.deactivated');
    });
  });

  describe('kind map keyed by type (AC#2 / CC-C09)', () => {
    test('every type verb declares a kind', () => {
      for (const type of Object.values(ServiceChannelType)) {
        expect(serviceChannelKind[type]).toBeDefined();
      }
    });

    test('network-map.activated is kind "event"', () => {
      expect(serviceChannelKind[ServiceChannelType.NETWORK_MAP_ACTIVATED]).toBe('event');
    });

    test('no map entry resolves to "ack" (ack is derived from the reply subject, not the type map)', () => {
      for (const kind of Object.values(serviceChannelKind)) {
        expect(kind === 'event' || kind === 'command').toBe(true);
        expect(kind).not.toBe('ack');
      }
    });

    test('the kind-map value type excludes "ack" at compile time', () => {
      const kind: 'event' | 'command' = serviceChannelKind[ServiceChannelType.NETWORK_MAP_ACTIVATED];
      expect(kind).toBeDefined();
      // @ts-expect-error - 'ack' must NOT be assignable as a kind-map value (Record<ServiceChannelType, 'event' | 'command'>)
      const bad: (typeof serviceChannelKind)[keyof typeof serviceChannelKind] = 'ack';
      expect(bad).toBe('ack');
    });
  });

  describe('generic construct<T>() wrapper (AC#3 / AC#4)', () => {
    const data: NetworkMapActivatedData = { cfg: '001@1.0.0', tenantId: 'tenant-a' };

    test('builds a CloudEvents 1.0 structured envelope with sensible defaults', () => {
      const event = construct<NetworkMapActivatedData>({
        type: ServiceChannelType.NETWORK_MAP_ACTIVATED,
        source: 'event-director',
        subject: 'tenant-a/001@1.0.0',
        data,
      });

      expect(event.specversion).toBe('1.0');
      expect(event.type).toBe('org.tazama.network-map.activated');
      expect(event.datacontenttype).toBe('application/json');
      expect(typeof event.id).toBe('string');
      expect(event.id.length).toBeGreaterThan(0);
      expect(event.data).toEqual(data);
    });

    test('every message gets its own fresh SDK-generated id', () => {
      const a = construct<NetworkMapActivatedData>({ type: ServiceChannelType.NETWORK_MAP_ACTIVATED, source: 'event-director', data });
      const b = construct<NetworkMapActivatedData>({ type: ServiceChannelType.NETWORK_MAP_ACTIVATED, source: 'event-director', data });
      expect(a.id).not.toBe(b.id);
    });

    test('throws on a malformed envelope (SDK strict validation on build)', () => {
      // missing required `source`
      expect(() => construct<NetworkMapActivatedData>({ type: ServiceChannelType.NETWORK_MAP_ACTIVATED, data } as never)).toThrow();
    });

    test('the ack rides the SAME generic envelope (it is a service-channel CloudEvent, not a bespoke schema)', () => {
      const ack = construct<ServiceChannelAck>({
        type: ServiceChannelType.NETWORK_MAP_ACTIVATED,
        source: 'typology-001@1.0.0',
        subject: 'tenant-a/001@1.0.0',
        data: { correlationId: 'evt-123', outcome: 'success' },
      });

      expect(ack.type).toBe('org.tazama.network-map.activated');
      expect(ack.data).toEqual({ correlationId: 'evt-123', outcome: 'success' });
      expect(validateEnvelope(ack)).toBe(true);
    });
  });

  describe('envelope re-check via the SDK non-generic validate() (AC#4)', () => {
    test('validateEnvelope returns true for a well-formed event', () => {
      const event = construct<NetworkMapActivatedData>({
        type: ServiceChannelType.NETWORK_MAP_ACTIVATED,
        source: 'event-director',
        data: { cfg: '001@1.0.0', tenantId: 'tenant-a' },
      });
      expect(validateEnvelope(event)).toBe(true);
    });
  });

  describe('audience addressing vocabulary + gate (AC#5)', () => {
    test('exposes the fixed class/broadcast token enum', () => {
      expect(SERVICE_CHANNEL_AUDIENCE.EVENT_DIRECTOR).toBe('event-director');
      expect(SERVICE_CHANNEL_AUDIENCE.TYPOLOGY_PROCESSOR).toBe('typology-processor');
      expect(SERVICE_CHANNEL_AUDIENCE.RULE_PROCESSOR).toBe('rule-processor');
      expect(SERVICE_CHANNEL_AUDIENCE.EVENT_ADJUDICATOR).toBe('event-adjudicator');
      expect(SERVICE_CHANNEL_AUDIENCE.ALL).toBe('all');
    });

    const identity = { class: SERVICE_CHANNEL_AUDIENCE.TYPOLOGY_PROCESSOR, functionName: 'typology-001@1.0.0' };

    test('acts when audience is absent (broadcast)', () => {
      expect(inAudience(undefined, identity)).toBe(true);
    });

    test('acts when audience is "all"', () => {
      expect(inAudience(SERVICE_CHANNEL_AUDIENCE.ALL, identity)).toBe(true);
    });

    test('acts when audience matches its class token', () => {
      expect(inAudience(SERVICE_CHANNEL_AUDIENCE.TYPOLOGY_PROCESSOR, identity)).toBe(true);
    });

    test('acts when audience names its own processor name', () => {
      expect(inAudience('typology-001@1.0.0', identity)).toBe(true);
    });

    test('ignores when audience is a different class token', () => {
      expect(inAudience(SERVICE_CHANNEL_AUDIENCE.EVENT_DIRECTOR, identity)).toBe(false);
    });

    test('ignores when audience names a different processor', () => {
      expect(inAudience('rule_001', identity)).toBe(false);
    });
  });

  describe('compile-time payload type aliases (AC#3)', () => {
    test('network-map.activated data is identifier-only { cfg, tenantId }', () => {
      const data: NetworkMapActivatedData = { cfg: '001@1.0.0', tenantId: 'tenant-a' };
      expect(data).toEqual({ cfg: '001@1.0.0', tenantId: 'tenant-a' });
    });

    test('ack data carries { correlationId, outcome, error? }', () => {
      const ack: ServiceChannelAck = { correlationId: 'evt-123', outcome: 'success' };
      const failed: ServiceChannelAck = { correlationId: 'evt-123', outcome: 'failure', error: 'boom' };
      expect(ack.correlationId).toBe('evt-123');
      expect(failed.error).toBe('boom');
    });

    test('ack outcome is loosely typed (any string is accepted)', () => {
      const ack: ServiceChannelAck = { correlationId: 'evt-123', outcome: 'PARTIALLY_APPLIED' };
      expect(ack.outcome).toBe('PARTIALLY_APPLIED');
    });

    test('kind union and audience-class type exist', () => {
      const kind: ServiceChannelKind = 'ack';
      const klass: ServiceChannelAudienceClass = 'event-director';
      expect(kind).toBe('ack');
      expect(klass).toBe('event-director');
    });
  });

  describe('consumer deserialize<T>() boundary (#422)', () => {
    const data: NetworkMapActivatedData = { cfg: '001@1.0.0', tenantId: 'tenant-a' };
    const encode = (event: CloudEvent<NetworkMapActivatedData>): Uint8Array => new TextEncoder().encode(JSON.stringify(event));

    test('round-trips a produced event back to an equivalent CloudEvent (the wire format admin-service publishes)', () => {
      const original = construct<NetworkMapActivatedData>({
        type: ServiceChannelType.NETWORK_MAP_ACTIVATED,
        source: 'admin-service',
        subject: 'tenant-a/001@1.0.0',
        data,
      });
      const decoded = deserialize<NetworkMapActivatedData>(encode(original));
      expect(decoded.id).toBe(original.id);
      expect(decoded.type).toBe(original.type);
      expect(decoded.source).toBe(original.source);
      expect(decoded.subject).toBe(original.subject);
      expect(decoded.datacontenttype).toBe('application/json');
      expect(decoded.data).toEqual(data);
    });

    test('the decoded envelope passes validateEnvelope (the consumer re-check at the deserialize boundary)', () => {
      const bytes = encode(
        construct<NetworkMapActivatedData>({ type: ServiceChannelType.NETWORK_MAP_ACTIVATED, source: 'admin-service', data }),
      );
      expect(validateEnvelope(deserialize<NetworkMapActivatedData>(bytes))).toBe(true);
    });

    test('carries the data type parameter through to the decoded event', () => {
      const bytes = encode(
        construct<NetworkMapActivatedData>({ type: ServiceChannelType.NETWORK_MAP_ACTIVATED, source: 'admin-service', data }),
      );
      const decoded = deserialize<NetworkMapActivatedData>(bytes);
      expect(decoded.data?.tenantId).toBe('tenant-a');
      expect(decoded.data?.cfg).toBe('001@1.0.0');
    });

    test('round-trips a data-less event (data is optional in the envelope)', () => {
      const bytes = encode(construct<NetworkMapActivatedData>({ type: ServiceChannelType.NETWORK_MAP_ACTIVATED, source: 'admin-service' }));
      const decoded = deserialize<NetworkMapActivatedData>(bytes);
      expect(decoded.data).toBeUndefined();
      expect(validateEnvelope(decoded)).toBe(true);
    });

    test('throws on non-JSON wire bytes', () => {
      const garbage = new TextEncoder().encode('not-json{');
      expect(() => deserialize<NetworkMapActivatedData>(garbage)).toThrow();
    });

    test('throws on empty wire bytes', () => {
      expect(() => deserialize<NetworkMapActivatedData>(new Uint8Array())).toThrow();
    });

    test('throws on valid JSON that is not an envelope object', () => {
      const notAnObject = new TextEncoder().encode('42');
      expect(() => deserialize<NetworkMapActivatedData>(notAnObject)).toThrow();
    });

    test('throws on a structurally malformed envelope (missing the required type)', () => {
      const bytes = new TextEncoder().encode(JSON.stringify({ specversion: '1.0', id: 'evt-1', source: 'admin-service', data }));
      expect(() => deserialize<NetworkMapActivatedData>(bytes)).toThrow();
    });

    test('is re-exported from the package barrel (public surface)', () => {
      expect(deserializeFromBarrel).toBe(deserialize);
    });
  });
});
