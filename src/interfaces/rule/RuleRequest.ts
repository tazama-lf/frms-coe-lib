// SPDX-License-Identifier: Apache-2.0

import type { NetworkMap } from '../NetworkMap';
import type { DataCache } from '..';
import type { MetaData } from '../metaData';

export interface RuleRequest {
  transaction: any;
  networkMap: NetworkMap;
  DataCache: DataCache;
  metaData?: MetaData;
}
