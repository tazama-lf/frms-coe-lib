// SPDX-License-Identifier: Apache-2.0

/* eslint-disable */

import { NetworkMap } from '..';
import { Alert } from './Alert';

export class CMSRequest {
  message = '';
  report: Alert = new Alert();
  transaction: any;
  networkMap: NetworkMap = new NetworkMap();
}
