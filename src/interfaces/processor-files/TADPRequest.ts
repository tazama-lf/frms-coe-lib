// SPDX-License-Identifier: Apache-2.0

import type { NetworkMap, Pacs002 } from '..';
import type { MetaData } from '../metaData';
import type { TypologyResult } from './TypologyResult';

export interface TADPRequest {
  typologyResult: TypologyResult;
  transaction: Pacs002;
  networkMap: NetworkMap;
  metaData?: MetaData;
}
