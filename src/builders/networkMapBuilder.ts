import { aql, Database } from 'arangojs';
import { type AqlQuery } from 'arangojs/aql';
import * as fs from 'fs';
import { dbNetworkMap } from '../interfaces/ArangoCollections';
import { type DatabaseManagerType, type DBConfig, readyChecks } from '../services/dbManager';
import { isDatabaseReady } from '../helpers/readyCheck';

export async function networkMapBuilder(manager: DatabaseManagerType, NetworkMapConfig: DBConfig): Promise<void> {
  manager._networkMap = new Database({
    url: NetworkMapConfig.url,
    databaseName: NetworkMapConfig.databaseName,
    auth: {
      username: NetworkMapConfig.user,
      password: NetworkMapConfig.password,
    },
    agentOptions: {
      ca: fs.existsSync(NetworkMapConfig.certPath) ? [fs.readFileSync(NetworkMapConfig.certPath)] : [],
    },
  });

  try {
    readyChecks.NetworkMapDB = (await isDatabaseReady(manager._networkMap)) ? 'Ok' : 'err';
  } catch (err) {
    readyChecks.NetworkMapDB = err;
  }

  manager.getNetworkMap = async () => {
    const db = manager._networkMap!.collection(dbNetworkMap.netConfig);
    const networkConfigurationQuery: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.active == true
        RETURN doc
      `;
    return await (await manager._networkMap!.query(networkConfigurationQuery)).batches.all();
  };
}
