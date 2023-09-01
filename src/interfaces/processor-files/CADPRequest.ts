import { type NetworkMap, type Pacs002 } from '..';
import { type TypologyResult } from './TypologyResult';

export class CADPRequest {
  typologyResult: TypologyResult;
  transaction: Pacs002;
  networkMap: NetworkMap;
  metaData?: { prcgTmDp: number; prcgTmCRSP: number };
  constructor(typologyResult: TypologyResult, transaction: Pacs002, networkMap: NetworkMap, ruleResults: []) {
    this.typologyResult = typologyResult;
    this.transaction = transaction;
    this.networkMap = networkMap;
    this.typologyResult.ruleResults = ruleResults;
  }
}

export class CombinedResult {
  typologyResult = '';
  cadpRequests: CADPRequest[] = [];
}
