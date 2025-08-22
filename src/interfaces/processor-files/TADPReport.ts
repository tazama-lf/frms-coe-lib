import type { DataCache, NetworkMap, Pacs002 } from '../../interfaces';
import type { Alert } from '../../interfaces/processor-files/Alert';

export interface Evaluation {
  dataCache?: DataCache;
  networkMap: NetworkMap;
  transactionID: string;
  transaction: Pacs002;
  report: Alert;
}
