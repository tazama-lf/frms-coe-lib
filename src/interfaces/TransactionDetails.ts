// SPDX-License-Identifier: Apache-2.0

export interface TransactionDetails {
  source: string;
  destination: string;
  TxTp: string;
  MsgId: string;
  CreDtTm: string;
  Amt?: string;
  Ccy?: string;
  EndToEndId: string;
  lat?: string;
  long?: string;
  TxSts?: string;
}
