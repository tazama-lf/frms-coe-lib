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

export interface Edge {
  id: string;
  source: string;
  destination: string;
  evtTp: string[];
  tenantId: string;
  incptnDtTm: string;
  xprtnDtTm?: string;
}

export interface Entity {
  id: string;
  creDtTm: string;
  TenantId: string;
}

export interface Account {
  id: string;
  TenantId: string;
}

export interface Condition {
  condId: string;
  evtTp: string[];
  tenantId: string;
  condTp: string;
  prsptv: string;
  incptnDtTm: string;
  xprtnDtTm?: string;
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