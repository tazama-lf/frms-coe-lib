/* eslint-disable */

import { NetworkMap } from '..';
import { Alert } from './Alert';

export class CMSRequest {
  message = '';
  alert: Alert = new Alert();
  transaction: any;
  networkMap: NetworkMap = new NetworkMap();
}
