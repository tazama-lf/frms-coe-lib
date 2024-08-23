import type { MetaData } from '../metaData';
import type { Condition } from './Condition';
import type { Edge, Entity, Acct, Ntty } from './EntityConditionEdge';

export interface Entry {
  edge: Edge;
  entity: Entity;
  condition: MetaData & Condition;
}
export interface ConditionDetails extends Pick<Condition, 'incptnDtTm' | 'xprtnDtTm'> {
  condId: string;
  condTp: string;
  condRsn: string;
  usr: string;
  creDtTm: string;
  prsptvs: Array<Pick<Condition, 'prsptv' | 'evtTp' | 'incptnDtTm' | 'xprtnDtTm'>>;
}

export interface ConditionResponse {
  // one of ntty and acct, never both
  ntty?: Ntty;
  acct?: Acct;
  conditions: ConditionDetails[];
}
