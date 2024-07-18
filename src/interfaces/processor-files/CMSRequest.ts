// SPDX-License-Identifier: Apache-2.0

import { NetworkMap } from '..';
import { Alert } from './Alert';

export class CMSRequest {
  message = '';
  report: Alert = new Alert();
  transaction: unknown;
  networkMap: NetworkMap = new NetworkMap();
}
