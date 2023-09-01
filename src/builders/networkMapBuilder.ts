import { aql, Database } from 'arangojs';
import { type AqlQuery } from 'arangojs/aql';
import * as fs from 'fs';
import { formatError } from '../helpers/formatter';
import { isDatabaseReady } from '../helpers/readyCheck';
import { dbNetworkMap } from '../interfaces/ArangoCollections';
import { readyChecks, type DatabaseManagerType, type DBConfig } from '../services/dbManager';

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
    const dbReady = await isDatabaseReady(manager._networkMap);
    readyChecks.NetworkMapDB = dbReady ? 'Ok' : 'err';
  } catch (error) {
    const err = error as Error;
    readyChecks.NetworkMapDB = `err, ${formatError(err)}`;
  }

  manager.getNetworkMap = async () => {
    const db = manager._networkMap?.collection(dbNetworkMap.netConfig);
    const networkConfigurationQuery: AqlQuery = aql`
        FOR doc IN ${db}
        FILTER doc.active == true
        RETURN doc
      `;
    return await (await manager._networkMap?.query(networkConfigurationQuery))?.batches.all();
  };
}
