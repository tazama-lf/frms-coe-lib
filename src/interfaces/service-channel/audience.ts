// SPDX-License-Identifier: Apache-2.0

/**
 * The fixed class/broadcast addressing vocabulary owned by the contract.
 *
 * A message's `audience` is either one of these closed class tokens (`all` = broadcast) or a free-form,
 * deployment-defined processor name (not enumerated here). See {@link inAudience} for the match rule.
 */
export type ServiceChannelAudienceClass = 'event-director' | 'typology-processor' | 'rule-processor' | 'event-adjudicator' | 'all';
