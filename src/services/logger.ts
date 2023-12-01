import { config } from '../config';
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

const logger =
  config.nodeEnv === 'dev' || config.nodeEnv === 'test' ? console : pino({ level: config.logger.logstashLevel.toLowerCase(), stream });

type GenericFunction = (...args: unknown[]) => unknown;
type LogFunc = (message: string, serviceOperation?: string, callback?: GenericFunction) => void;

export class LoggerService {
  /*
   * Internal fields are called by the class when each respective method is called
   *
   * Each field is by default `null`, see `constructor()` for how each log level is set */
  #info: LogFunc = () => null;
  #debug: LogFunc = () => null;
  #trace: LogFunc = () => null;
  #warn: LogFunc = () => null;
  #error: (message: string | Error, innerError?: unknown, serviceOperation?: string, callback?: GenericFunction) => void = () => null;

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

  #createErrorFn(): (message: string | Error, innerError?: unknown, serviceOperation?: string) => void {
    return (message: string | Error, innerError?: unknown, serviceOperation?: string): void => {
      let errMessage = typeof message === 'string' ? message : message.stack ?? message.message;

      if (innerError) {
        if (innerError instanceof Error) {
          errMessage = `${errMessage}\r\n${innerError.stack ?? innerError.message}`;
        }
      }
      logger.error({ message: errMessage, serviceOperation });
    };
  }

  #createLogCallback(level: 'trace' | 'info' | 'warn' | 'debug'): LogFunc {
    switch (level) {
      case 'trace':
        return (message: string, serviceOperation?: string, callback?: GenericFunction): void => {
          if (this.#lumberjackService) {
            this.#lumberjackService.log(message, level, serviceOperation, callback);
          } else {
            logger.trace({ message, serviceOperation });
          }
        };
      case 'debug':
        return (message: string, serviceOperation?: string, callback?: GenericFunction): void => {
          if (this.#lumberjackService) {
            this.#lumberjackService.log(message, level, serviceOperation, callback);
          } else {
            logger.debug({ message, serviceOperation });
          }
        };
      case 'warn':
        return (message: string, serviceOperation?: string, callback?: GenericFunction): void => {
          if (this.#lumberjackService) {
            this.#lumberjackService.log(message, level, serviceOperation, callback);
          } else {
            logger.warn({ message, serviceOperation });
          }
        };
      default:
        return (message: string, serviceOperation?: string, callback?: GenericFunction): void => {
          if (this.#lumberjackService) {
            this.#lumberjackService.log(message, 'info', serviceOperation, callback);
          } else {
            logger.info({ message, serviceOperation });
          }
        };
    }
  }

  trace(message: string, serviceOperation?: string, callback?: GenericFunction): void {
    this.#trace(message, serviceOperation, callback);
  }

  log(message: string, serviceOperation?: string, callback?: GenericFunction): void {
    this.#info(message, serviceOperation, callback);
  }

  warn(message: string, serviceOperation?: string, callback?: GenericFunction): void {
    this.#warn(message, serviceOperation, callback);
  }

  error(message: string | Error, innerError?: unknown, serviceOperation?: string, callback?: GenericFunction): void {
    this.#error(message, innerError, serviceOperation, callback);
  }

  debug(message: string, serviceOperation?: string, callback?: GenericFunction): void {
    this.#debug(message, serviceOperation, callback);
  }
}
