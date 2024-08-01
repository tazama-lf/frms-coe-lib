import { type Othr } from '../Pacs.008.001.10';

export interface EntityCondition {
  evtTp: string[];
  incptnDtTm: string;
  xprtnDtTm?: string;
  condTp: string;
  prsptv: string;
  condRsn: string;
  ntty: Othr;
  forceCret: boolean;
  usr: string;
  creDtTm: string;
}
