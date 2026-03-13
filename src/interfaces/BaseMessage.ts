// SPDX-License-Identifier: Apache-2.0

import type { DataCache } from './rule/DataCache';
import type { Pacs002 } from './Pacs.002.001.12';
import type { TransferAmount } from './TransferAmount';

export interface BaseMessage<T = unknown> {
    TxTp: string;
    TenantId: string;
    Payload: T;
    DataCache?: DataCache;
}

export type Pacs002Payload = Omit<Pacs002, 'TxTp' | 'TenantId' | 'DataCache'>;

export type SupportedTransactionPayload = Pacs002Payload | TransferAmount;

export type SupportedTransactionMessage = BaseMessage<SupportedTransactionPayload>;