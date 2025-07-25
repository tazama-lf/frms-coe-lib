// SPDX-License-Identifier: Apache-2.0

import type { NetworkMap, Pacs002 } from '..';
import type { TypologyResult } from './TypologyResult';

export class TADPRequest {
  typologyResult: TypologyResult;
  transaction: Pacs002;
  networkMap: NetworkMap;
  metaData?: { prcgTmDp: number; prcgTmED: number };
  constructor(typologyResult: TypologyResult, transaction: Pacs002, networkMap: NetworkMap, ruleResults: []) {
    this.typologyResult = typologyResult;
    this.transaction = transaction;
    this.networkMap = networkMap;
    this.typologyResult.ruleResults = ruleResults;
  }
}

export class CombinedResult {
  typologyResult = '';
  tadpRequests: TADPRequest[] = [];
}
