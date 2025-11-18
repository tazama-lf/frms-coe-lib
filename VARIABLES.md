# Environment Variables

## Overview
All environment variables are essential when instantiating each object's classes within the library. This design enables the library to require environment variables on demand, ensuring that each class has the necessary configuration before it operates.

**Required Environment Variables**
Each class may depend on specific environment variables for proper instantiation and functionality. Ensure that all required variables are set in your environment before running the application.

**Processor-Based Validation**
Certain classes may require processor-based validation objects to determine additional environment variables. For example:

Logging Class: This class needs configuration variables to check the environment the processor is running on. Depending on the setup, it will log messages either through Pino or the console.


### General Variables

| Variables    |  DataType | Optional |
| -------- | -------- | -------- | 
| FUNCTION_NAME  | String | No |
| NODE_ENV | String | No |
| MAX_CPU | Number | Yes |


### Redis Variables

| Variables | DataType | Optional | 
| -------- | ------- | ------- | 
| REDIS_DB | Number | No | 
| REDIS_AUTH | String | No |
| REDIS_SERVERS | String | No | 
| REDIS_IS_CLUSTER | Boolean | No |

 
### Database Variables (Postgres)

 ##### 1. RAW HISTORY DATABASE 

| Variables | DataType | Optional |
| -------- | ------- | ------- | 
| RAW_HISTORY_DATABASE | String | No | 
| RAW_HISTORY_DATABASE_HOST | String | No | 
| RAW_HISTORY_DATABASE_PORT | String | Yes | 
| RAW_HISTORY_DATABASE_USER | String | Controllable | 
| RAW_HISTORY_DATABASE_PASSWORD |  String | Controllable | 
| RAW_HISTORY_DATABASE_CERT_PATH |  String | No | 

##### 2. EVENT HISTORY DATABASE 

| Variables | DataType | Optional | 
| -------- | ------- | ------- | 
| EVENT_HISTORY_DATABASE |  String | No | 
| EVENT_HISTORY_DATABASE_HOST |  String | No | 
| EVENT_HISTORY_DATABASE_PORT |  String | Yes | 
| EVENT_HISTORY_DATABASE_USER |  String | Controllable |  
| EVENT_HISTORY_DATABASE_PASSWORD |  String | Controllable | 
| EVENT_HISTORY_DATABASE_CERT_PATH |  String | No | 

##### 3. CONFIGURATION DATABASE 

| Variables | DataType | Optional | 
| -------- | ------- | ------- | 
| CONFIGURATION_DATABASE |  String | No | 
| CONFIGURATION_DATABASE_HOST | String | No |   
| CONFIGURATION_DATABASE_PORT | String | YES |   
| CONFIGURATION_DATABASE_USER |  String | Controllable |  
| CONFIGURATION_DATABASE_PASSWORD |  String | Controllable |  
| CONFIGURATION_DATABASE_CERT_PATH |  String | No | 

##### 4. EVALUATION DATABASE 

| Variables | DataType | Optional | 
| -------- | ------- | ------- | 
| EVALUATION_DATABASE | String | No |  
| EVALUATION_DATABASE_HOST |  String | No |  
| EVALUATION_DATABASE_PORT |  String | YES |  
| EVALUATION_DATABASE_USER |  String | Controllable |  
| EVALUATION_DATABASE_PASSWORD |  String | Controllable | 
| EVALUATION_DATABASE_CERT_PATH |  String | No |  

### Elastic Variables

| Variables | DataType | Optional | 
| -------- | ------- | ------- |
| APM_ACTIVE | Boolean | No | 
| APM_SERVICE_NAME | String | No unless APM_ACTIVE=`false` | 
| APM_URL | String | No unless APM_ACTIVE=`false` | 
| APM_SECRET_TOKEN | String | No unless APM_ACTIVE=`false` |

### Logging Variables

| Variables | DataType | Optional | 
| -------- | ------- | ------- | 
| LOG_LEVEL | String | Yes | 
| SIDECAR_HOST | String | Yes | 
