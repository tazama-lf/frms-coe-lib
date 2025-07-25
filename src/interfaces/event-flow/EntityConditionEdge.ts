export interface EntityMetaData {
  _key: string;
  _id: string;
  _rev: string;
}

export interface RawConditionResponse {
  governed_as_creditor_by: Result[];
  governed_as_debtor_by: Result[];
  governed_as_creditor_account_by: Result[];
  governed_as_debtor_account_by: Result[];
}

export interface Result {
  edge: Edge;
  result: Entity | Account;
  condition: EntityCondition | AccountCondition;
}

export interface Edge extends EntityMetaData {
  _from: string;
  _to: string;
  evtTp: string[];
  tenantId: string;
  incptnDtTm: string;
  xprtnDtTm: string;
}

export interface Entity extends EntityMetaData {
  Id: string;
  CreDtTm: string;
  TenantId: string;
}

export interface Account extends EntityMetaData {
  TenantId: string;
}

export interface Condition extends EntityMetaData {
  evtTp: string[];
  tenantId: string;
  condTp: string;
  prsptv: string;
  incptnDtTm: string;
  xprtnDtTm: string;
  condRsn: string;
  forceCret: boolean;
  usr: string;
  creDtTm: string;
}
export interface EntityCondition extends Condition {
  ntty: Ntty;
}
export interface AccountCondition extends Condition {
  acct: Acct;
}
export interface Ntty {
  id: string;
  schmeNm: SchmeNm;
}

export interface SchmeNm {
  prtry: string;
}
export interface Acct extends Ntty {
  agt: Agt;
}

export interface Agt {
  finInstnId: FinInstnId;
}

export interface FinInstnId {
  clrSysMmbId: ClrSysMmbId;
}

export interface ClrSysMmbId {
  mmbId: string;
}
