// SPDX-License-Identifier: Apache-2.0

import pino, { type DestinationStream, type Logger } from 'pino';
import { validateLogConfig } from '../config/index';
import type { ProcessorConfig } from '../config/processor.config';
import { type LogCallback, createElasticStream } from '../helpers/logUtilities';
import type { LogLevel } from '../helpers/proto/lumberjack/LogLevel';
import type { LumberjackGRPCService } from './lumberjackGRPCService';

const config = validateLogConfig();

const pinoStream = (): DestinationStream | undefined => {
  if (config.pinoElasticOpts?.elasticHost.length) {
    const { stream } = createElasticStream(
      config.pinoElasticOpts.elasticHost,
      config.pinoElasticOpts.elasticVersion,
      config.pinoElasticOpts.elasticUsername,
      config.pinoElasticOpts.elasticPassword,
      config.pinoElasticOpts.flushBytes,
      config.pinoElasticOpts.elasticIndex,
    );
    return stream;
  }
};

const LOGLEVEL = config.logLevel.toLowerCase();

type LogFunc = (message: string, serviceOperation?: string, id?: string, callback?: LogCallback) => void;
type ErrorFunc = (message: string | Error, innerError?: unknown, serviceOperation?: string, id?: string, callback?: LogCallback) => void;

const createErrorFn =
  (logger: Console | Logger, grpcClient?: LumberjackGRPCService): ErrorFunc =>
  (message: string | Error, innerError?: unknown, serviceOperation?: string, id?: string, callback?: LogCallback): void => {
    let errMessage = typeof message === 'string' ? message : (message.stack ?? message.message);

    if (innerError) {
      if (innerError instanceof Error) {
        errMessage = `${errMessage}\r\n${innerError.stack ?? innerError.message}`;
      } else if (typeof innerError === 'string') {
        errMessage = `${errMessage}\r\n${innerError}`;
      }
    }

    if (grpcClient) {
      grpcClient.log(errMessage, 'error', serviceOperation, id, callback);
    } else {
      logger.error({ message: errMessage, serviceOperation, id });
    }
  };

const createLogCallback = (level: LogLevel, logger: Console | Logger, grpcClient?: LumberjackGRPCService): LogFunc => {
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
  logger: Console | Logger;
  /* for enabling logging through the sidecar */

  lumberjackService: LumberjackGRPCService | undefined = undefined;

  constructor(processorConfig: ProcessorConfig) {
    const config = validateLogConfig();
    if (processorConfig.nodeEnv === 'dev' || processorConfig.nodeEnv === 'test') {
      this.logger = console;
    } else {
      this.logger = pino({ level: LOGLEVEL }, pinoStream());
    }
    switch (config.logLevel.toLowerCase()) {
      // error > warn > info > debug > trace
      case 'trace':
        this.trace = createLogCallback('trace', this.logger, this.lumberjackService);
        this.debug = createLogCallback('debug', this.logger, this.lumberjackService);
        this.log = createLogCallback('info', this.logger, this.lumberjackService);
        this.warn = createLogCallback('warn', this.logger, this.lumberjackService);
        this.error = createErrorFn(this.logger, this.lumberjackService);
        break;
      case 'debug':
        this.debug = createLogCallback('debug', this.logger, this.lumberjackService);
        this.log = createLogCallback('info', this.logger, this.lumberjackService);
        this.warn = createLogCallback('warn', this.logger, this.lumberjackService);
        this.error = createErrorFn(this.logger, this.lumberjackService);
        break;
      case 'info':
        this.log = createLogCallback('info', this.logger, this.lumberjackService);
        this.warn = createLogCallback('warn', this.logger, this.lumberjackService);
        this.error = createErrorFn(this.logger, this.lumberjackService);
        break;
      case 'warn':
        this.warn = createLogCallback('warn', this.logger, this.lumberjackService);
        this.error = createErrorFn(this.logger, this.lumberjackService);
        break;
      case 'error':
        this.error = createErrorFn(this.logger, this.lumberjackService);
        break;
      case 'fatal':
        this.error = createErrorFn(this.logger, this.lumberjackService);
        break;
      default:
        break;
    }
  }

  fatal(message: string | Error, innerError?: unknown, serviceOperation?: string, id?: string, callback?: LogCallback): void {
    this.error(message, innerError, serviceOperation, id, callback);
  }
}
