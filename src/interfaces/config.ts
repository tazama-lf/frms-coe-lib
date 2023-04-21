export interface RedisConfig {
  db: number;
  host: string;
  port: number;
  password: string;
}

export interface LoggerConfig {
  logstashHost: string;
  logstashPort: string;
  functionName: string;
}

export interface ArangoConfig {
  certPath: string;
  db: {
    pseudonyms: {
      name: string;
      pseudonyms_collection: string;
    };
    transactionhistory: {
      name: string;
      collection: string;
      transactionhistory_pacs008_collection: string;
    };
    url: string;
    user: string;
    password: string;
  };
}
