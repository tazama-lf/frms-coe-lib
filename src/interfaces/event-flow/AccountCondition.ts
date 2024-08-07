import { type Condition } from './Condition';

export interface AccountCondition extends Condition {
  acct: {
    id: string;
    schmeNm: {
      prtry: string;
    };
  };
}
