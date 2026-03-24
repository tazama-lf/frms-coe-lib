// SPDX-License-Identifier: Apache-2.0

import type { DataCache } from './rule/DataCache';
import type { Pacs002 } from './Pacs.002.001.12';
// import type { TransferAmount } from './TransferAmount';

export interface BaseType {
  TxTp: string;
  TenantId: string;
  DataCache?: DataCache;
}
export interface BaseMessage extends BaseType {
  Payload: Record<string, unknown>;
}

// export type SupportedTransactionPayload = Pacs002 | TransferAmount;

// export type SupportedTransactionMessage = BaseMessage<SupportedTransactionPayload>;
export type SupportedTransactionMessage = BaseMessage | Pacs002;
