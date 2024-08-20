## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  - [1. **Database Management**](#1-database-management)
  - [2. **Logger Service**](#2-logger-service)
  - [3. **Apm Integration**](#3-apm-integration)
  - [4. **Redis Service**](#4-redis-service)
- [Modules and Classes](#modules-and-classes)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Configuration Options](#configuration-options)
  - [Usage Example](#usage-example)
- [Contributing](#contributing)
- [License](#license)

## Overview

`frms-coe-lib` is a foundational library designed to provide common functionalities and interfaces for the FRMS (Fraud Risk Management System) ecosystem. It includes utilities, data structures, and interfaces that support various components of the system. The library offers a range of features, including database management, logging, configuration management, rule evaluation, and message handling. It serves as a core dependency for other FRMS components, providing essential building blocks and standardized approaches for handling data and interactions.

Key features:
- **Database Management**: Interfaces and utilities for interacting with different database systems, including ArangoDB and Redis.
- **Logging**: A standardized logging interface supporting various log levels and integration with external systems.
- **Configuration**: Tools for managing application configuration, including environment variable parsing and structured configuration objects.
- **Protocol Buffers**: Support for serialization and deserialization of messages using Protocol Buffers.
- **Rule Management**: Structures and utilities for defining and evaluating rules within the FRMS ecosystem.

## Installation

The npm package is hosted on GitHub. Make sure you're authenticated with GitHub and have the necessary permissions to access the package (`read:packages`). Create a [`.npmrc`](https://docs.npmjs.com/cli/v9/configuring-npm/npmrc?v=true) file if you currently do not have. Add the following content:
```.rc
@tazama-lf:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=some-secret
```
Replace "some-secret" with your GitHub Token.

To install the `frms-coe-lib` package, you can use npm.

1. **Install via npm:**

   ```sh
   npm install @tazama-lf/frms-coe-lib --registry=https://npm.pkg.github.com
   ```

The npm package is hosted on GitHub. Make sure you're authenticated with GitHub and have the necessary permissions to access the package (`read:packages`).

2. **Importing in your project:**

Once installed, you can import the library in your project:

  ```typescript
  import { LoggerService, CreateDatabaseManager } from '@tazama-lf/frms-coe-lib';
  ```

3. **Dependencies:**

    Ensure that you have all required dependencies installed, including any specific versions of third-party packages mentioned in the package's peer dependencies.

4. **Environment Configuration:**

    Set up your environment configuration using a `.env` file or environment variables. Refer to the library's configuration requirements for details on necessary environment variables.

## Usage

The `frms-coe-lib` library provides various functionalities for transaction monitoring, logging, and database management. Below is an overview of how to use the key features of the library.

### 1. **Database Management**

The `CreateDatabaseManager` function initializes and manages connections to multiple databases, including ArangoDB and Redis. This function returns an instance of `DatabaseManagerInstance` which includes methods to interact with the databases.

**Usage Example:**
```typescript
import { CreateDatabaseManager, DatabaseManagerInstance } from '@tazama-lf/frms-coe-lib';

const dbConfig = {
  configuration: {
    url: 'database-url',
    databaseName: 'database-name',
    user: 'username',
    password: 'password',
    certPath: 'path-to-cert',
  }
};

let databaseManager: DatabaseManagerInstance<typeof dbConfig>;
databaseManager = await CreateDatabaseManager(dbConfig);

```

### 2. **Logger Service**

The `LoggerService` class provides logging functionality, supporting different log levels like `info`, `debug`, `warn`, and `error`. It can also log messages to a GRPC service.

**Usage Example:**
```typescript
import { LoggerService } from '@tazama-lf/frms-coe-lib';

const logger = new LoggerService('localhost:50051');

logger.log('This is an info message');
logger.warn('This is a warning');
logger.error(new Error('This is an error message'));
```

### 3. **Apm Integration**

The `Apm` class integrates with Elastic APM to track performance and errors. It provides methods to start transactions and spans.

**Usage Example:**
```typescript
import { Apm } from '@tazama-lf/frms-coe-lib';

const apm = new Apm({
  serviceName: 'my-service',
  secretToken: 'apm-secret-token',
  serverUrl: 'apm-server-url',
  active: true,
});

const transaction = apm.startTransaction('transaction-name');
const span = apm.startSpan('span-name');

// Do something

span.end();
transaction.end();
```

### 4. **Redis Service**

The `RedisService` class provides methods to interact with Redis, including setting and getting JSON data, managing sets, and handling binary data.

**Example:**
```typescript
import { RedisService } from '@tazama-lf/frms-coe-lib';

async function useRedis() {
  const redisConfig = {
    db: 0,
    servers: [{ host: 'localhost', port: 6379 }],
    password: 'redis-password',
    isCluster: false,
  };

  const redisService = await RedisService.create(redisConfig);
  await redisService.setJson('key', JSON.stringify({ field: 'value' }), 300);
  const value = await redisService.getJson('key');
  console.log(value);

  import { CreateDatabaseManager, DatabaseManagerInstance } from '@tazama-lf/frms-coe-lib';

const dbConfig = {
  redisConfig: {
    db: 0,
    servers: [{ host: 'localhost', port: 6379 }],
    password: 'redis-password',
    isCluster: false,
  }
};

let databaseManager: DatabaseManagerInstance<typeof dbConfig>;
databaseManager = await CreateDatabaseManager(dbConfig);

```

## Modules and Classes

1. **ProtoBuf Module**

  - **Class**: `ProtoGrpcType`
    - **Description**: Contains definitions related to Google Protocol Buffers for message types.
    - **Methods**:
      - `google.protobuf.Empty`: Represents an empty message.
      - `lumberjack.LogLevel`: Enum representing log levels.
      - `lumberjack.LogMessage`: Represents a log message.
      - `lumberjack.Lumberjack`: Represents the Lumberjack service with methods like `SendLog`.

2. **Logger Service**

  - **Class**: `LoggerService`
    - **Description**: Provides logging capabilities, including sending logs to Lumberjack via gRPC or using Pino for ElasticSearch.
    - **Methods**:
      - `log(message: string, serviceOperation?: string, id?: string, callback?: LogCallback): void`: Logs a message.
      - `debug(message: string, serviceOperation?: string, id?: string, callback?: LogCallback): void`: Logs a debug message.
      - `trace(message: string, serviceOperation?: string, id?: string, callback?: LogCallback): void`: Logs a trace message.
      - `warn(message: string, serviceOperation?: string, id?: string, callback?: LogCallback): void`: Logs a warning message.
      - `error(message: string | Error, innerError?: unknown, serviceOperation?: string, id?: string, callback?: LogCallback): void`: Logs an error message.
      - `fatal(message: string | Error, innerError?: unknown, serviceOperation?: string, id?: string, callback?: LogCallback): void`: Logs a fatal error message.

3. **Database Manager**

  - **Class**: `DatabaseManager`
    - **Description**: Manages database connections and interactions, including configuration and pseudonyms databases.
    - **Methods**:
      - `CreateDatabaseManager<T>(config: T): Promise<DatabaseManagerInstance<T>>`: Creates a database manager instance.
      - `isReadyCheck(): any`: Checks if the database services are ready.
      - `quit(): void`: Closes all database connections.

4. **Apm Service**

  - **Class**: Apm
    - **Description**: Provides APM (Application Performance Management) integration using Elastic APM.
    - **Methods**:
      - `startTransaction(name: string, options?: TransactionOptions): apm.Transaction | null`: Starts a new transaction.
      - `startSpan(name: string): apm.Span | null`: Starts a new span.
      - `getCurrentTraceparent(): string | null`: Retrieves the current traceparent.

5. **Redis Service**

  - **Class**: RedisService
    - **Description**: Provides methods for interacting with Redis, including setting and getting data.
    - **Methods**:
      - `getJson(key: string): Promise<string>`: Retrieves a JSON value from Redis.
      - `getBuffer(key: string): Promise<Record<string, unknown>>`: Retrieves a buffer value from Redis.
      - `getMemberValues(key: string): Promise<Array<Record<string, unknown>>>`: Retrieves members of a Redis set.
      - `deleteKey(key: string): Promise<void>`: Deletes a key from Redis.
      - `setJson(key: string, value: string, expire: number): Promise<void>`: Sets a JSON value in Redis with an expiration time.
      - `set(key: string, value: RedisData, expire: number): Promise<void>`: Sets a value in Redis with an expiration time.
      - `setAdd(key: string, value: Record<string, unknown>): Promise<void>`: Adds a value to a Redis set.
      - `addOneGetAll(key: string, value: Record<string, unknown>): Promise<Array<Record<string, unknown>>>`: Adds a value to a Redis set and retrieves all members.
      - `addOneGetCount(key: string, value: Record<string, unknown>): Promise<number>`: Adds a value to a Redis set and retrieves the count of members.
      - `quit(): void`: Closes the Redis connection.

6. **Protobuf Utilities**

  - **Functions**:
    - `createMessageBuffer(data: Record<string, unknown>): Buffer | undefined`: Creates a message buffer from a data object.
    - `createLogBuffer(data: Record<string, unknown>): Buffer | undefined`: Creates a log buffer from a data object.
    - `decodeLogBuffer(buffer: Buffer): LogMessageType | undefined`: Decodes a log buffer into a `LogMessageType`.

7. **Unwrap Utility**

  - **Functions**:
    - `unwrap<T>(type: T[][]): T | undefined`: Unwraps a 2D array and returns the item at `[0][0]`.

## Configuration

### Environment Variables

The `frms-coe-lib` library uses environment variables to configure logging for any processor that is using it the logging for more information about logging here is the [link](https://github.com/frmscoe/docs/blob/dev/Technical/Logging/The-Tazama-Logging-Framework.md) . Here are the key environment variables some variables are required only when NODE_ENV is set to `production`:

**PROCESSOR ENVIRONMENT VARIABLES**

| Variable Name | Purpose                             | Default value           | Requirement             |
| ------------- | ----------------------------------- | ----------------------- | ----------------------- |
| FUNCTION_NAME | Specifies the port number to use    | `null`                  | Mandatory               |
| RULE_VERSION  | Specifies the NATS server address   | `null`                  | Optional                |
| NODE_ENV      | Defines the NATS subject/topic name | `null`                  | Mandatory               |

**LOGSTASH ENVIRONMENT VARIABLES**

| Variable Name  | Purpose                                                 | Default value | Requirement                     |
| -------------- | ------------------------------------------------------- | ------------- | ------------------------------- |
| LOGSTASH_LEVEL | Specifies the minimum log level to capture logs for     | `info`        | Optional                        |
| LOGSTASH_PORT  | Specifies port of logstash from the server hosting it   | `0`           | Optional                        |
| LOGSTASH_HOST  | Specifies address of the host that has logstash exposed | `null`        | Optional `Unless on Production` |

**ELASTIC ENVIRONMENT VARIABLES**

| Variable Name          | Purpose                                     | Default value           | Requirement                     |
| ---------------------- | ------------------------------------------- | ----------------------- | ------------------------------- |
| ELASTIC_SEARCH_VERSION | Specifies the Elasticsearch version         | `8.11`                  | Optional `Unless on Production` |
| ELASTIC_HOST           | Specifies the Elasticsearch host            | `http://localhost:9200` | Optional `Unless on Production` |
| ELASTIC_USERNAME       | Username for Elasticsearch authentication   | `''`                    | Optional `Unless on Production` |
| ELASTIC_PASSWORD       | Password for Elasticsearch authentication   | `''`                    | Optional `Unless on Production` |

**APM ENVIRONMENT VARIABLES**

| Variable           | Purpose                                                              | Default value       | Requirement  |
| ------------------ | -------------------------------------------------------------------- | ------------------- | ------------ |
| APM_LOGGING        | Boolean to flag if you would like to have apm logging                | `true`              | Optional     |
| APM_SECRET_TOKEN   | Token used for authentication and authorization with the APM system. | `''` _Deprecated_   | Optional     |



### Configuration Options
The ManagerConfig interface allows you to define which databases and services you wish to use. Each service can be optionally included in the configuration:

- **Pseudonyms Database**: Manage user pseudonyms. `Optional`
- **Transaction History Database**: Access and manage transaction histories. `Optional`
- **Transaction Database**: Handle transactional operations. `Optional`
- **Configuration Database**: Store and retrieve application configurations. `Optional`
- **Redis Cache**: Use Redis for caching to improve performance. `Optional`

### Usage Example
The JSON object example for dbManage configuration
```typescript
{
    pseudonyms: {
      url: 'your-pseudonyms-db-url',
      user: 'your-user',
      password: 'your-password',
      databaseName: 'your-db-name',
      certPath: 'path-to-cert',
    },
    transactionHistory: {
      url: 'your-transaction-history-db-url',
      user: 'your-user',
      password: 'your-password',
      databaseName: 'your-db-name',
      certPath: 'path-to-cert',
    },
    redisConfig: {
      host: 'your-redis-host',
      port: 6379,
      password: 'your-redis-password',
    },
};

```

## Contributing

If you want to contribute to the `frms-coe-lib`, please clone the repository and submit a pull request to the `dev` branch.

## License

This library is a component of the Tazama project. The Tazama project is licensed under the Apache 2.0 License.

