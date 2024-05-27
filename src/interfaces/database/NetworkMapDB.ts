// SPDX-License-Identifier: Apache-2.0

import { type Database } from 'arangojs';

export interface NetworkMapDB {
  _networkMap: Database;

  /**
   * Finds all active networkmaps
   *
   * ```
   * const query = aql`
   * FOR doc IN ${collection}
   * FILTER doc.active == true
   * RETURN doc
   * ```
   *
   * @memberof NetworkMapDB
   */
  getNetworkMap: () => Promise<unknown>;
}
