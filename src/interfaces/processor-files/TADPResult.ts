// SPDX-License-Identifier: Apache-2.0

import type { TypologyResult } from './TypologyResult';

export class TADPResult {
  id = '';
  cfg = '';
  typologyResult: TypologyResult[] = [];
  prcgTm? = 0;
}
