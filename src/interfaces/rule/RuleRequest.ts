// SPDX-License-Identifier: Apache-2.0

import type { NetworkMap } from '../NetworkMap';
import type { DataCache } from '..';
import type { MetaData } from '../metaData';

export interface RuleRequest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Transaction type varies based on payment message format
  transaction: any;
  networkMap: NetworkMap;
  DataCache: DataCache;
  metaData?: MetaData;
}
