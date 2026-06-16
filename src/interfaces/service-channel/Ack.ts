// SPDX-License-Identifier: Apache-2.0

/**
 * The `data` payload of an acknowledgement.
 *
 * An ack is itself a service-channel CloudEvent (not a bespoke schema): it reuses the triggering
 * message's `type`, is minted its own fresh `id`, and back-references the triggering message via
 * `correlationId` (the triggering message's `id`). The correlation lives in `data` - alongside the
 * execution result (`outcome` / `error`) - rather than an envelope extension, because the ack's
 * `data` is itself the response metadata.
 */
export interface ServiceChannelAck {
  correlationId: string;
  outcome: string;
  error?: string;
}
