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

## Troubleshooting
#### npm install
Ensure generated token has read package rights