// SPDX-License-Identifier: Apache-2.0

/**
 * The `data` payload for `org.tazama.network-map.activated`.
 *
 * Identifier-only by design: consumers re-fetch the full network map from the source of truth.
 * Erased at compile time (pure type), so it adds zero runtime footprint.
 */
export interface NetworkMapActivatedData {
  cfg: string;
  tenantId: string;
}
