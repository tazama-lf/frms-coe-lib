
import { v4 } from 'uuid';
import { TADPResult } from './TADPResult';

export class Alert {
    evaluationID = v4();
    status = ''; // eg ALRT
    timestamp: Date = new Date();
    tadpResult: TADPResult = new TADPResult();
}