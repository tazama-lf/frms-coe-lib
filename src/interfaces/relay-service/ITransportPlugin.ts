// SPDX-License-Identifier: Apache-2.0

export interface ITransportPlugin {
  init: () => Promise<void>;
  relay: (data: Uint8Array | string) => Promise<void>;
}