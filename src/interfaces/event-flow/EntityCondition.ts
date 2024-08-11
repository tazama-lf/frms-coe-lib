import { type Condition } from './Condition';

export interface EntityCondition extends Condition {
  ntty: {
    id: string;
    schmeNm: {
      prtry: string;
    };
  };
}
