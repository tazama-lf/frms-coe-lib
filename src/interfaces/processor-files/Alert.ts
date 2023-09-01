import { v4 } from 'uuid';
import { TADPResult } from './TADPResult';
import { MetaData } from '../metaData';

export class Alert {
  evaluationID = v4();
  metaData? = new MetaData();
  status = ''; // eg ALRT
  timestamp: Date = new Date();
  tadpResult: TADPResult = new TADPResult();
}
