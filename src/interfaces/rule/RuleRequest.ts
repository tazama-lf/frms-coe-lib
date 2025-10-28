// SPDX-License-Identifier: Apache-2.0

import type { Pacs002 } from '../Pacs.002.001.12';
import type { NetworkMap } from '../NetworkMap';
import type { DataCache } from '..';
import type { MetaData } from '../metaData';

export interface RuleRequest {
  transaction: Pacs002;
  networkMap: NetworkMap;
  DataCache: DataCache;
  metaData?: MetaData;
}
