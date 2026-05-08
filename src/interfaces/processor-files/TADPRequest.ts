// SPDX-License-Identifier: Apache-2.0

import type { NetworkMap, SupportedTransactionMessage } from '..';
import type { MetaData } from '../metaData';
import type { TypologyResult } from './TypologyResult';

export interface TADPRequest {
  typologyResult: TypologyResult;
  transaction: SupportedTransactionMessage;
  networkMap: NetworkMap;
  metaData?: MetaData;
}
