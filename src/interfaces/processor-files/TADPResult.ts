// SPDX-License-Identifier: Apache-2.0

import type { TypologyResult } from './TypologyResult';

export interface TADPResult {
  id: string;
  cfg: string;
  typologyResult: TypologyResult[];
  prcgTm?: number;
}
