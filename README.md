# FRMS Center of Excellence Library

<div align="center">
  <img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/frmscoe/frms-coe-lib/publish.yml">
  <img alt="GitHub package.json version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/v/frmscoe/frms-coe-lib">
  <img alt="GitHub" src="https://img.shields.io/github/license/frmscoe/frms-coe-lib">
</div>

## Overview
This is the central library for FRMS. A reusable wrapper to external services such as database queries and redis methods. Contains shared data models for unification and simplification of changes.

## Environment variables
While this library doesn't require environmental variables to function. When using certain components the library will parse environmental variables for the following services:
- LoggerService  

| Variable | Required | Purpose | Example
| ------ | ------ | ------ | ------ |
| `FUNCTION_NAME` | Yes | Identifier of the application which will show up in the logs as the originator of the log. (Usually application name)
| `NODE_ENV` | No | Represents the environment the application is currently running in | `test`, `dev`
| `LOGSTASH_HOST` | No | 
| `LOGSTASH_PORT` | No | 
| `LOGSTASH_LEVEL` | No | Level of log granularity | `log`, `debug`, `trace` `warn` `error`
| `ELASTIC_HOST` | No | 
| `ELASTIC_INDEX` | No |
| `ELASTIC_USERNAME` | No |
| `ELASTIC_PASSWORD` | No |
| `ELASTIC_SEARCH_VERSION` | No |
| `APM_LOGGING` | No |
| `APM_SECRET_TOKEN` | No |
| `RULE_VERSION` | No |

## Installation

A personal access token is required to install this repository. For more information read the following.
https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries

Thereafter you can run 
  > npm install @frmscoe/frms-coe-lib

## Database Manager Example Usage

```ts
// Import functionality and types
import {
  CreateDatabaseManager,  
  type ManagerConfig,
  type DatabaseManagerInstance,
} from '@frmscoe/frms-coe-lib';

// Configuration options defined in the CreateDatabaseManager
const dbManager: DatabaseManagerInstance<ManagerConfig> = await CreateDatabaseManager({
    redisConfig: {
      db: config.redis.db,
      servers: config.redis.servers,
      password: config.redis.password,
      isCluster: config.redis.isCluster,
    },
    transactionHistory: {
      certPath: config.transactionHistoryCertPath,
      databaseName: config.transactionHistoryName,
      user: config.transactionHistoryUser,
      password: config.transactionHistoryPassword,
      url: config.transactionHistoryURL,
    },
    configuration: {
      url: config.configurationURL,
      user: config.configurationUser,
      password: config.configurationPassword,
      databaseName: config.configDb,
      certPath: config.configurationCertPath,
      localCacheEnabled: !!config.cacheTTL,
      localCacheTTL: config.cacheTTL,
    },
    pseudonyms: {
      url: config.pseudonymsURL,
      user: config.pseudonymsUser,
      password: config.pseudonymsPassword,
      databaseName: config.graphDb,
      certPath: config.pseudonymsCertPath,
      localCacheEnabled: !!config.cacheTTL,
      localCacheTTL: config.cacheTTL,
    }
  });

  // Execute query
  await databaseManager.getTransactionPacs008('1234567890-4e48-8f50-fc52942b3425')
```

## Interfaces, Classes and Data Types
```js

// Database interfaces are found under 
import { ConfigurationDB } from '@frmscoe/frms-coe-lib/lib/interfaces/database/ConfigurationDB';
import { NetworkMapDB } from '@frmscoe/frms-coe-lib/lib/interfaces/database/NetworkMapDB';
import { PseudonymsDB } from '@frmscoe/frms-coe-lib/lib/interfaces/database/PseudonymsDB';
import { TransactionDB } from '@frmscoe/frms-coe-lib/lib/interfaces/database/TransactionDB';
import { TransactionHistoryDB } from '@frmscoe/frms-coe-lib/lib/interfaces/database/TransactionHistoryDB';

// Some simple method-less classes can be found under
import * as frms from '@frmscoe/frms-coe-lib/lib/interfaces';
/*
  // frms will give access to 
  frms.Message
  frms.NetworkMap
  frms.Rule
  frms.RuleResult
  frms.Typology
*/

// Pain and Pacs interfaces are also here
import { Pacs002 } from '@frmscoe/frms-coe-lib/lib/interfaces';

// Other data types are nested deeper under interfaces
// eg. Data cache can be found
import { DataCache } from '@frmscoe/frms-coe-lib/lib/interfaces/rule/DataCache';
// Also RuleConfig, RuleRequest and RuleResult

// Some processor classes for Request/Results
import { TADPResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TADPResult';
import { TypologyResult } from '@frmscoe/frms-coe-lib/lib/interfaces/processor-files/TypologyResult';

```

## Troubleshooting
#### npm install
Ensure generated token has read package rights