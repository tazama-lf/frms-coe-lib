import { type TypologyResult } from './TypologyResult';

export class ChannelResult {
  id = '';
  cfg = '';
  prcgTm? = 0;
  result = 0.0;
  typologyResult: TypologyResult[] = [];
}
