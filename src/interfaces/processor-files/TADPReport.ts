import type { DataCache, NetworkMap, SupportedTransactionMessage } from '../../interfaces';
import type { Alert } from '../../interfaces/processor-files/Alert';

export interface Evaluation {
  dataCache?: DataCache;
  networkMap: NetworkMap;
  transactionID: string;
  transaction: SupportedTransactionMessage;
  report: Alert;
}
