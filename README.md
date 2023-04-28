# frms-coe-lib

FRMS Center of Excellence package library.

## install

npm install @frmscoe/frms-coe-lib

## usage

```ts
// import functionality and types
import { RedisConfig, CreateDatabaseManager, DatabaseManagerInstance, ManagerConfig, TransactionHistoryDB} from "@frmscoe/frms-coe-lib/lib";

// Populate the Config for redis and transactionHistory
const transactionHistoryManager: DatabaseManagerInstance<ManagerConfig> =
  await CreateDatabaseManager({
    redisConfig: {
      db: 0,
      host: "localhost",
      password: "",
      port: 6379,
    },
    transactionHistory: {
      certPath: "/PATH/TO/CERT",
      databaseName: "transactionHistory",
      user: "admin",
      password: "",
      url: "https://arango.development",
    },
  });

  // Execute redis/transactionHistory queries
  await transactionHistoryManager.getTransactionPacs008('1234567890-4e48-8f50-fc52942b3425')
```
