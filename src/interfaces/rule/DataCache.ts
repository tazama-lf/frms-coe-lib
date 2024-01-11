export interface DataCache {
  dbtrId?: string;
  cdtrId?: string;
  dbtrAcctId?: string;
  cdtrAcctId?: string;
  evtId?: string;
  amt?: {
    Amt: number;
    Ccy: string;
  };
  CreDtTm?: string;
}
