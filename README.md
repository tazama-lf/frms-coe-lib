# frms-coe-lib

<div align="center">
  <img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/frmscoe/frms-coe-lib/publish.yml">
  <img alt="GitHub package.json version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/v/frmscoe/frms-coe-lib">
  <img alt="GitHub" src="https://img.shields.io/github/license/frmscoe/frms-coe-lib">
</div>

FRMS Center of Excellence package library.

## Installation

A personal access token is required to install this repository. For more information read the following.
https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries

Thereafter you can run 
  > npm install @frmscoe/frms-coe-lib

## Usage

```ts
// Import functionality and types
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
