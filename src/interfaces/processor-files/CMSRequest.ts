// SPDX-License-Identifier: Apache-2.0

import type { NetworkMap, SupportedTransactionMessage } from '..';
import type { Alert } from './Alert';

export interface CMSRequest {
  message: string;
  networkMap: NetworkMap;
  report: Alert;
  transaction: SupportedTransactionMessage;
}
