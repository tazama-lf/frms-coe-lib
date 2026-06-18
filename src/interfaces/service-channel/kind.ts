// SPDX-License-Identifier: Apache-2.0

/**
 * The message-role axis of the service-channel profile (compile-time only - not on the wire in the MVP).
 *
 * `event` and `command` are derived by both sides from the shared `type` enum keyed by `type`;
 * `ack` is derived by a consumer from the reply subject (CC-C14). Because `ack` reuses the triggering
 * message's `type`, it is never resolvable from the type-keyed `kind` map - hence the map is constrained
 * to `'event' | 'command'` and this union is used only for typing ack payloads.
 */
export type ServiceChannelKind = 'event' | 'command' | 'ack';
