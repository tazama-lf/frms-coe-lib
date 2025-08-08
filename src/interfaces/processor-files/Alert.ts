// SPDX-License-Identifier: Apache-2.0

import { v4 } from 'uuid';
import { TADPResult } from './TADPResult';
import { MetaData } from '../metaData';

export class Alert {
  evaluationID = v4();
  metaData? = new MetaData();
  status = ''; // eg ALRT
  timestamp: string = new Date().toISOString();
  tadpResult: TADPResult = new TADPResult();
}
