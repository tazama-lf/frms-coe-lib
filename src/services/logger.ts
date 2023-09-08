import { config } from '../config';
import log4js from 'log4js';

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

const devEnv = config.nodeEnv === 'dev' || config.nodeEnv === 'test';
const logger = devEnv ? console : log4js.getLogger();

const createTimeStamp = (): string => {
  const dateObj = new Date();

  let date = dateObj.toISOString();
  date = date.substring(0, date.indexOf('T'));

  const time = dateObj.toLocaleTimeString([], { hour12: false });

  return `${date} ${time}`;
};

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
  constructor() {
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
    return createTimeStamp();
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
          logger.trace(`${this.messageStamp(serviceOperation)}[${level.toUpperCase()}] - ${message}`);
        };
      case 'debug':
        return (message: string, serviceOperation?: string): void => {
          logger.debug(`${this.messageStamp(serviceOperation)}[${level.toUpperCase()}] - ${message}`);
        };
      case 'warn':
        return (message: string, serviceOperation?: string): void => {
          logger.warn(`${this.messageStamp(serviceOperation)}[${level.toUpperCase()}] - ${message}`);
        };

      default:
        return (message: string, serviceOperation?: string): void => {
          logger.info(`${this.messageStamp(serviceOperation)}[${level.toUpperCase()}] - ${message}`);
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
