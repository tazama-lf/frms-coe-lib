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

const logger = config.nodeEnv === 'dev' || config.nodeEnv === 'test' ? console : log4js.getLogger();

export class LoggerService {
  timeStamp(): string {
    const dateObj = new Date();

    let date = dateObj.toISOString();
    date = date.substring(0, date.indexOf('T'));

    const time = dateObj.toLocaleTimeString([], { hour12: false });

    return `${date} ${time}`;
  }

  messageStamp(serviceOperation?: string): string {
    return `[${this.timeStamp()}][${config.functionName}${serviceOperation ? ' - ' + serviceOperation : ''}]`;
  }

  trace(message: string, serviceOperation?: string): void {
    logger.trace(`${this.messageStamp(serviceOperation)}[TRACE] - ${message}`);
  }

  log(message: string, serviceOperation?: string): void {
    logger.info(`${this.messageStamp(serviceOperation)}[INFO] - ${message}`);
  }

  warn(message: string, serviceOperation?: string): void {
    logger.warn(`${this.messageStamp(serviceOperation)}[WARN] - ${message}`);
  }

  error(message: string | Error, innerError?: unknown, serviceOperation?: string): void {
    let errMessage = typeof message === 'string' ? message : message.stack ?? message.message;

    if (innerError) {
      if (innerError instanceof Error) {
        errMessage = `${errMessage}\r\n${innerError.stack ?? innerError.message}`;
      }
    }

    logger.error(`${this.messageStamp(serviceOperation)}[ERROR] - ${errMessage}`);
  }

  debug(message: string, serviceOperation?: string): void {
    logger.debug(`${this.messageStamp(serviceOperation)}[DEBUG] - ${message}`);
  }
}
