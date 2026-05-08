// SPDX-License-Identifier: Apache-2.0

import type { DataCache } from './rule/DataCache';
import type { Pacs002 } from './Pacs.002.001.12';

export interface BaseMessage {
  TxTp: string;
  TenantId: string;
  MsgId: string;
  Payload: Record<string, unknown>;
  endpointPath?: string;
  DataCache?: DataCache;
}

export type SupportedTransactionMessage = BaseMessage | Pacs002;
