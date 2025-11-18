import type { MetaData } from '../metaData';
import type { Edge, Entity, Acct, Ntty, Condition } from './EntityConditionEdge';

export interface Entry {
  edge: Edge;
  entity: Entity;
  condition: MetaData & Condition;
}
export interface ConditionDetails extends Pick<Condition, 'incptnDtTm' | 'xprtnDtTm' | 'tenantId'> {
  condId: string;
  condTp: string;
  condRsn: string;
  usr: string;
  creDtTm: string;
  prsptvs: Array<Pick<Condition, 'prsptv' | 'evtTp' | 'incptnDtTm' | 'xprtnDtTm'>>;
}

export interface EntityConditionResponse {
  ntty: Ntty;
  conditions: ConditionDetails[];
}

export interface AccountConditionResponse {
  acct: Acct;
  conditions: ConditionDetails[];
}