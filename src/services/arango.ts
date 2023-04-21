import { aql, Database } from "arangojs";
import { AqlQuery } from "arangojs/aql";
import * as fs from "fs";
import {
  Pacs002,
  Pacs008,
  Pain001,
  Pain013,
  TransactionRelationship,
} from "../interfaces";
import { ArangoConfig } from "../interfaces/config";
import { LoggerService } from "./logger";

export class ArangoDBService {
  private readonly transactionHistoryClient: Database;
  private readonly pseudonymsClient: Database;
  private readonly logger: LoggerService;
  private readonly config: ArangoConfig;

  private constructor(config: ArangoConfig, logger: LoggerService) {
    this.logger = logger;
    this.config = config;

    const caOption = fs.existsSync(config.certPath)
      ? [fs.readFileSync(config.certPath)]
      : [];

    if (caOption.length === 0)
      this.logger.warn("🟠 ArangoDB was not supplied with a certificate");

    this.pseudonymsClient = new Database({
      url: this.config.db.url,
      databaseName: this.config.db.pseudonyms.name,
      auth: {
        username: this.config.db.user,
        password: this.config.db.password,
      },
      agentOptions: {
        ca: caOption,
      },
    });

    this.transactionHistoryClient = new Database({
      url: this.config.db.url,
      databaseName: this.config.db.transactionhistory.name,
      auth: {
        username: this.config.db.user,
        password: this.config.db.password,
      },
      agentOptions: {
        ca: caOption,
      },
    });

    if (this.pseudonymsClient.isArangoDatabase) {
      this.logger.log("✅ ArangoDB connection is ready");
    } else {
      logger.error("❌ ArangoDB connection is not ready");
      throw new Error("ArangoDB connection is not ready");
    }
  }

  public static async create(
    config: ArangoConfig,
    logger: LoggerService
  ): Promise<ArangoDBService> {
    const arangoInstance = new ArangoDBService(config, logger);
    return arangoInstance;
  }

  async query(query: AqlQuery, client: Database): Promise<unknown> {
    try {
      const cycles = await client.query(query);
      const results = await cycles.batches.all();

      this.logger.log(`Query result: ${JSON.stringify(results)}`);

      return results;
    } catch (error) {
      this.logger.error(
        "Error while executing query from arango with message:",
        error as Error,
        "ArangoDBService"
      );
      throw new Error(
        `Error while executing query from arango with message: ${
          error as Error
        }`
      );
    }
  }

  async save(
    client: Database,
    collectionName: string,
    data: any,
    saveOptions?: any
  ): Promise<void> {
    try {
      await client
        .collection(collectionName)
        .save(data, saveOptions || undefined);
    } catch (error) {
      this.logger.error(
        `Error while saving data to collection ${collectionName} with document\n ${JSON.stringify(
          data
        )}`
      );
      if (saveOptions)
        this.logger.error(`With save options: ${JSON.stringify(saveOptions)}`);
      this.logger.error(JSON.stringify(error));
      throw new Error(
        `Error while saving data to collection ${collectionName}`
      );
    }
  }

  async getPseudonyms(hash: string): Promise<any> {
    const db = this.pseudonymsClient.collection(
      this.config.db.pseudonyms.pseudonyms_collection
    );
    const query = aql`FOR i IN ${db}
      FILTER i.pseudonym == ${hash}
      RETURN i`;

    return this.query(query, this.pseudonymsClient);
  }

  async getTransactionHistoryPacs008(EndToEndId: string): Promise<any> {
    const db = this.transactionHistoryClient.collection(
      this.config.db.transactionhistory.transactionhistory_pacs008_collection
    );
    const query = aql`FOR doc IN ${db} 
      FILTER doc.EndToEndId == ${EndToEndId} 
      RETURN doc`;

    return this.query(query, this.transactionHistoryClient);
  }

  async addAccount(hash: string): Promise<any> {
    return this.save(
      this.pseudonymsClient,
      "accounts",
      { _key: hash },
      { overwriteMode: "ignore" }
    );
  }

  async addEntity(entityId: string, CreDtTm: string): Promise<any> {
    return this.save(
      this.pseudonymsClient,
      "entities",
      {
        _key: entityId,
        Id: entityId,
        CreDtTm,
      },
      { overwriteMode: "ignore" }
    );
  }

  async addAccountHolder(
    entityId: string,
    accountId: string,
    CreDtTm: string
  ): Promise<any> {
    return this.save(
      this.pseudonymsClient,
      "account_holder",
      {
        _from: `entities/${entityId}`,
        _to: `accounts/${accountId}`,
        CreDtTm,
      },
      { overwriteMode: "ignore" }
    );
  }

  async saveTransactionRelationship(tR: TransactionRelationship): Promise<any> {
    return this.save(
      this.pseudonymsClient,
      "transactionRelationship",
      {
        _key: tR.MsgId,
        _from: tR.from,
        _to: tR.to,
        TxTp: tR.TxTp,
        CreDtTm: tR.CreDtTm,
        Amt: tR.Amt,
        Ccy: tR.Ccy,
        PmtInfId: tR.PmtInfId,
        EndToEndId: tR.EndToEndId,
        lat: tR.lat,
        long: tR.long,
      },
      { overwriteMode: "ignore" }
    );
  }

  async saveTransactionHistory(
    transaction: Pain001 | Pain013 | Pacs008 | Pacs002,
    transactionhistorycollection: string
  ): Promise<any> {
    return this.save(
      this.transactionHistoryClient,
      transactionhistorycollection,
      transaction,
      {
        overwriteMode: "ignore",
      }
    );
  }

  async savePseudonym(pseudonym: any): Promise<any> {
    return this.save(
      this.pseudonymsClient,
      this.config.db.pseudonyms.pseudonyms_collection,
      pseudonym,
      {
        overwriteMode: "ignore",
      }
    );
  }
}
