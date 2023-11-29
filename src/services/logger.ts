import { config } from '../config';
import log4js from 'log4js';
import { pino, type LoggerOptions } from 'pino';
import pinoElastic, { type DestinationStream } from 'pino-elasticsearch';
import { LumberjackService } from './lumberjack';
import { ecsFormat } from '@elastic/ecs-pino-format';

interface ElasticLogger {
  stream: DestinationStream;
  ecsOpts: LoggerOptions;
}

const { stream } = createElasticStream(
  config.logger.pinoElasticOpts.elasticHost,
  config.logger.pinoElasticOpts.elasticVersion,
  config.logger.pinoElasticOpts.elasticUsername,
  config.logger.pinoElasticOpts.elasticPassword,
  config.logger.pinoElasticOpts.flushBytes,
  config.logger.pinoElasticOpts.elasticIndex,
);

export function createElasticStream(
  node: string,
  esVersion: number,
  username: string,
  password: string,
  flushBytes: number,
  index?: string,
): ElasticLogger {
  const streamToElastic = pinoElastic({
    index,
    node,
    esVersion,
    auth: {
      username,
      password,
    },
    flushBytes,
  });

  const elasticOpts = ecsFormat();
  return {
    stream: streamToElastic,
    ecsOpts: elasticOpts,
  };
}

// unused
if (config.nodeEnv !== 'dev' && config.nodeEnv !== 'test') {
  log4js.configure({
    appenders: {
      logstash: {
        type: '@log4js-node/logstash-http',
        url: `http://${config.logger.logstashHost}:${config.logger.logstashPort}/_bulk`,
        application: 'logstash-log4js',
        logType: 'application',
        logChannel: config.functionName,
      },
    },
    categories: {
      default: { appenders: ['logstash'], level: config.logger.logstashLevel },
    },
  });
}

const logger =
  config.nodeEnv === 'dev' || config.nodeEnv === 'test' ? console : pino({ level: config.logger.logstashLevel.toLowerCase(), stream });

export class LoggerService {
  /*
   * Internal fields are called by the class when each respective method is called
   *
   * Each field is by default `null`, see `constructor()` for how each log level is set */
  #info: (message: string, serviceOperation?: string) => void = () => null;
  #debug: (message: string, serviceOperation?: string) => void = () => null;
  #trace: (message: string, serviceOperation?: string) => void = () => null;
  #warn: (message: string, serviceOperation?: string) => void = () => null;
  #error: (message: string | Error, innerError?: unknown, serviceOperation?: string) => void = () => null;

  /* for enabling logging through the sidecar */

  #lumberjackService: LumberjackService | undefined = undefined;

  constructor(sidecarHost?: string) {
    if (sidecarHost) {
      this.#lumberjackService = new LumberjackService(sidecarHost, config.functionName);
    }
    switch (config.logger.logstashLevel.toLowerCase()) {
      // error > warn > info > debug > trace
      case 'trace':
        this.#trace = this.#createLogCallback('trace');
        this.#debug = this.#createLogCallback('debug');
        this.#info = this.#createLogCallback('info');
        this.#warn = this.#createLogCallback('warn');
        this.#error = this.#createErrorFn();
        break;
      case 'debug':
        this.#debug = this.#createLogCallback('debug');
        this.#info = this.#createLogCallback('info');
        this.#warn = this.#createLogCallback('warn');
        this.#error = this.#createErrorFn();
        break;
      case 'info':
        this.#info = this.#createLogCallback('info');
        this.#warn = this.#createLogCallback('warn');
        this.#error = this.#createErrorFn();
        break;
      case 'warn':
        this.#warn = this.#createLogCallback('warn');
        this.#error = this.#createErrorFn();
        break;
      case 'error':
        this.#error = this.#createErrorFn();
        break;
      default:
        break;
    }
  }

  timeStamp(): string {
    const dateObj = new Date();

    let date = dateObj.toISOString();
    date = date.substring(0, date.indexOf('T'));

    const time = dateObj.toLocaleTimeString([], { hour12: false });

    return `${date} ${time}`;
  }

  #createErrorFn(): (message: string | Error, innerError?: unknown, serviceOperation?: string) => void {
    return (message: string | Error, innerError?: unknown, serviceOperation?: string): void => {
      let errMessage = typeof message === 'string' ? message : message.stack ?? message.message;

      if (innerError) {
        if (innerError instanceof Error) {
          errMessage = `${errMessage}\r\n${innerError.stack ?? innerError.message}`;
        }
      }

      logger.error(`${this.messageStamp(serviceOperation)}[ERROR] - ${errMessage}`);
    };
  }

  #createLogCallback(level: 'trace' | 'info' | 'warn' | 'debug'): (message: string, serviceOperation?: string) => void {
    switch (level) {
      case 'trace':
        return (message: string, serviceOperation?: string): void => {
          if (this.#lumberjackService) {
            this.#lumberjackService.log(message, level);
          } else {
            logger.trace(`${this.messageStamp(serviceOperation)}[TRACE] - ${message}`);
          }
        };
      case 'debug':
        return (message: string, serviceOperation?: string): void => {
          if (this.#lumberjackService) {
            this.#lumberjackService.log(message, level);
          } else {
            logger.debug(`${this.messageStamp(serviceOperation)}[DEBUG] - ${message}`);
          }
        };
      case 'warn':
        return (message: string, serviceOperation?: string): void => {
          if (this.#lumberjackService) {
            this.#lumberjackService.log(message, level);
          } else {
            logger.warn(`${this.messageStamp(serviceOperation)}[WARN] - ${message}`);
          }
        };
      default:
        return (message: string, serviceOperation?: string): void => {
          if (this.#lumberjackService) {
            this.#lumberjackService.log(message, 'info');
          } else {
            logger.info(`${this.messageStamp(serviceOperation)}[INFO] - ${message}`);
          }
        };
    }
  }

  messageStamp(serviceOperation?: string): string {
    return `[${this.timeStamp()}][${config.functionName}${serviceOperation ? ' - ' + serviceOperation : ''}]`;
  }

  trace(message: string, serviceOperation?: string): void {
    this.#trace(message, serviceOperation);
  }

  log(message: string, serviceOperation?: string): void {
    this.#info(message, serviceOperation);
  }

  warn(message: string, serviceOperation?: string): void {
    this.#warn(message, serviceOperation);
  }

  error(message: string | Error, innerError?: unknown, serviceOperation?: string): void {
    this.#error(message, innerError, serviceOperation);
  }

  debug(message: string, serviceOperation?: string): void {
    this.#debug(message, serviceOperation);
  }
}
