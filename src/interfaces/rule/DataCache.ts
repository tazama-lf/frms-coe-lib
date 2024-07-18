// SPDX-License-Identifier: Apache-2.0

export interface DataCache {
  dbtrId?: string;
  cdtrId?: string;
  dbtrAcctId?: string;
  cdtrAcctId?: string;
  evtId?: string;
  amt?: {
    amt: number;
    ccy: string;
  };
  creDtTm?: string;
}
