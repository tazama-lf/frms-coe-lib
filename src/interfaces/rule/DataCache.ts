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
