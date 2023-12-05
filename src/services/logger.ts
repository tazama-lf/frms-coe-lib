import { config } from '../config';
import { pino } from 'pino';
import { LumberjackGRPCService } from './lumberjackGRPCService';
import { type LogLevel } from '../helpers/proto/lumberjack/LogLevel';
import { type LogCallback, createElasticStream } from '../helpers/logUtilities';

const { stream } = createElasticStream(
  config.logger.pinoElasticOpts.elasticHost,
  config.logger.pinoElasticOpts.elasticVersion,
  config.logger.pinoElasticOpts.elasticUsername,
  config.logger.pinoElasticOpts.elasticPassword,
  config.logger.pinoElasticOpts.flushBytes,
  config.logger.pinoElasticOpts.elasticIndex,
);

const LOGLEVEL = config.logger.logstashLevel.toLowerCase();

const logger = config.nodeEnv === 'dev' || config.nodeEnv === 'test' ? console : pino({ level: LOGLEVEL, stream });

type LogFunc = (message: string, serviceOperation?: string, id?: string, callback?: LogCallback) => void;
type ErrorFunc = (message: string | Error, innerError?: unknown, serviceOperation?: string, id?: string, callback?: LogCallback) => void;

const createErrorFn = (grpcClient?: LumberjackGRPCService): ErrorFunc => {
  return (message: string | Error, innerError?: unknown, serviceOperation?: string, id?: string, callback?: LogCallback): void => {
    let errMessage = typeof message === 'string' ? message : message.stack ?? message.message;

    if (innerError) {
      if (innerError instanceof Error) {
        errMessage = `${errMessage}\r\n${innerError.stack ?? innerError.message}`;
      }
    }

    if (grpcClient) {
      grpcClient.log(errMessage, 'error', serviceOperation, id, callback);
    } else {
      logger.error({ message: errMessage, serviceOperation, id });
    }
  };
};

const createLogCallback = (level: LogLevel, grpcClient?: LumberjackGRPCService): LogFunc => {
  switch (level) {
    case 'trace':
      return (message: string, serviceOperation?: string, id?: string, callback?: LogCallback): void => {
        if (grpcClient) {
          grpcClient.log(message, level, serviceOperation, id, callback);
        } else {
          logger.trace({ message, serviceOperation, id });
        }
      };
    case 'debug':
      return (message: string, serviceOperation?: string, id?: string, callback?: LogCallback): void => {
        if (grpcClient) {
          grpcClient.log(message, level, serviceOperation, id, callback);
        } else {
          logger.debug({ message, serviceOperation, id });
        }
      };
    case 'warn':
      return (message: string, serviceOperation?: string, id?: string, callback?: LogCallback): void => {
        if (grpcClient) {
          grpcClient.log(message, level, serviceOperation, id, callback);
        } else {
          logger.warn({ message, serviceOperation, id });
        }
      };
    case 'fatal':
      return (message: string, serviceOperation?: string, id?: string, callback?: LogCallback): void => {
        if (grpcClient) {
          grpcClient.log(message, level, serviceOperation, id, callback);
        } else {
          // NOTE: 'fatal(...)' method is not available on a `console` logger
          logger.error({ message, serviceOperation, id });
        }
      };
    default:
      return (message: string, serviceOperation?: string, id?: string, callback?: LogCallback): void => {
        if (grpcClient) {
          grpcClient.log(message, 'info', serviceOperation, id, callback);
        } else {
          logger.info({ message, serviceOperation, id });
        }
      };
  }
};

export class LoggerService {
  /* Fields representing methods for different log levels
   *
   * Each field is by default `null`, see `constructor()` for how each log level is set */
  log: LogFunc = () => null;
  debug: LogFunc = () => null;
  trace: LogFunc = () => null;
  warn: LogFunc = () => null;
  error: (message: string | Error, innerError?: unknown, serviceOperation?: string, id?: string, callback?: LogCallback) => void = () =>
    null;

  /* for enabling logging through the sidecar */

  lumberjackService: LumberjackGRPCService | undefined = undefined;

  constructor(sidecarHost?: string) {
    if (sidecarHost) {
      this.lumberjackService = new LumberjackGRPCService(sidecarHost, config.functionName);
    }
    switch (config.logger.logstashLevel.toLowerCase()) {
      // error > warn > info > debug > trace
      case 'trace':
        this.trace = createLogCallback('trace', this.lumberjackService);
        this.debug = createLogCallback('debug', this.lumberjackService);
        this.log = createLogCallback('info', this.lumberjackService);
        this.warn = createLogCallback('warn', this.lumberjackService);
        this.error = createErrorFn(this.lumberjackService);
        break;
      case 'debug':
        this.debug = createLogCallback('debug', this.lumberjackService);
        this.log = createLogCallback('info', this.lumberjackService);
        this.warn = createLogCallback('warn', this.lumberjackService);
        this.error = createErrorFn(this.lumberjackService);
        break;
      case 'info':
        this.log = createLogCallback('info', this.lumberjackService);
        this.warn = createLogCallback('warn', this.lumberjackService);
        this.error = createErrorFn(this.lumberjackService);
        break;
      case 'warn':
        this.warn = createLogCallback('warn', this.lumberjackService);
        this.error = createErrorFn(this.lumberjackService);
        break;
      case 'error':
        this.error = createErrorFn(this.lumberjackService);
        break;
      case 'fatal':
        this.error = createErrorFn(this.lumberjackService);
        break;
      default:
        break;
    }
  }

  fatal(message: string | Error, innerError?: unknown, serviceOperation?: string, id?: string, callback?: LogCallback): void {
    this.error(message, innerError, serviceOperation, id, callback);
  }
}
