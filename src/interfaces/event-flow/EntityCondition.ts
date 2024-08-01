export interface EntityCondition {
  evtTp: string[];
  incptnDtTm: string;
  xprtnDtTm?: string;
  condTp: string;
  prsptv: string;
  condRsn: string;
  ntty: {
    id: string;
    schmeNm: {
      prtry: string;
    };
  };
  forceCret: boolean;
  usr: string;
  creDtTm: string;
}
