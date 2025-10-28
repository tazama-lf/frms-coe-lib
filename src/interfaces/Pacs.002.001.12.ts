// SPDX-License-Identifier: Apache-2.0

import type { DataCache } from './rule/DataCache';

export interface Pacs002 {
  TxTp: string;
  TenantId: string;
  FIToFIPmtSts: FIToFIPmtSts;
  DataCache?: DataCache;
}

interface FIToFIPmtSts {
  GrpHdr: GrpHdr;
  TxInfAndSts: TxInfAndSts;
}

interface GrpHdr {
  MsgId: string;
  CreDtTm: string;
}

interface TxInfAndSts {
  OrgnlInstrId: string;
  OrgnlEndToEndId: string;
  TxSts: string;
  ChrgsInf: ChrgsInf[];
  AccptncDtTm: Date;
  InstgAgt: Agt;
  InstdAgt: Agt;
}

interface ChrgsInf {
  Amt: Amt;
  Agt: Agt;
}

interface Agt {
  FinInstnId: FinInstnID;
}

interface FinInstnID {
  ClrSysMmbId: CLRSysMmbID;
}

interface CLRSysMmbID {
  MmbId: string;
}

interface Amt {
  Amt: number;
  Ccy: string;
}
