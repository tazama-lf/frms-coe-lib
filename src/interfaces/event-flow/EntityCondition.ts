import { type Condition } from './Condition';
import { type Ntty } from './EntityConditionEdge';

export interface EntityCondition extends Condition {
  ntty: Ntty;
}
