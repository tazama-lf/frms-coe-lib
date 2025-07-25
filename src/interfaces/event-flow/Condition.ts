export interface Condition {
  condId: string;
  tenantId: string;
  evtTp: string[];
  incptnDtTm: string;
  xprtnDtTm?: string;
  condTp: string;
  prsptv: string;
  condRsn: string;
  forceCret: boolean;
  usr: string;
  creDtTm: string;
}
