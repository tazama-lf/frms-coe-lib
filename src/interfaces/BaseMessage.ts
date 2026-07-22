// SPDX-License-Identifier: Apache-2.0

import type { DataCache } from './rule/DataCache';
import type { Pacs002 } from './Pacs.002.001.12';
import type { Pacs008 } from './Pacs.008.001.10';
import type { Pain001 } from './Pain.001.001.11';
import type { Pain013 } from './Pain.013.001.09';

export interface BaseMessage {
  TxTp: string;
  TenantId: string;
  MsgId: string;
  Payload: Record<string, unknown>;
  endpointPath?: string;
  DataCache?: DataCache;
}

export type SupportedTransactionMessage = BaseMessage | Pacs002 | Pacs008 | Pain001 | Pain013;
