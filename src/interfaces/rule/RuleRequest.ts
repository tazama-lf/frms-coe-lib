import { type Pacs002 } from '../Pacs.002.001.12';
import { type NetworkMap } from '../NetworkMap';
import { type DataCache } from '..';

export interface RuleRequest {
  transaction: Pacs002;
  networkMap: NetworkMap;
  dataCache: DataCache;
  metaData?: Record<string, unknown>;
}
