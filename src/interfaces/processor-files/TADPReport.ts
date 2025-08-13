import type { DataCache, NetworkMap, Pacs002 } from '../../interfaces';
import type { Alert } from '../../interfaces/processor-files/Alert';

export interface Evaluation {
  transactionID: string;
  transaction: Pacs002;
  networkMap: NetworkMap;
  report: Alert;
  dataCache: DataCache | undefined;
}
