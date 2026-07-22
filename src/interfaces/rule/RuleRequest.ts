// SPDX-License-Identifier: Apache-2.0

import type { NetworkMap } from '../NetworkMap';
import type { DataCache, SupportedTransactionMessage } from '..';
import type { MetaData } from '../metaData';

export interface RuleRequest<T extends SupportedTransactionMessage = SupportedTransactionMessage> {
  transaction: T;
  networkMap: NetworkMap;
  DataCache: DataCache;
  metaData?: MetaData;
}
