// SPDX-License-Identifier: Apache-2.0

export interface TransactionDetails {
  source: string;
  destination: string;
  TxTp: string;
  TenantId: string;
  MsgId: string;
  CreDtTm: string;
  Amt?: number;
  Ccy?: string;
  EndToEndId: string;
  lat?: string;
  long?: string;
  TxSts?: string;
}
