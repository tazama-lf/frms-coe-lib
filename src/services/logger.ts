import log4js from "log4js";
import { LoggerConfig } from "../interfaces/config";

export class LoggerService {
  private readonly logger: Console | log4js.Logger;
  private readonly functionName: string = "frms-coe-lib";

  private constructor(
    config: LoggerConfig | null,
    logger: Console | log4js.Logger
  ) {
    if(config) {
      this.functionName = config.functionName;
    }
    this.logger = logger;
  }

  public static create(config: LoggerConfig | null = null): LoggerService {
    if (config) {
      log4js.configure({
        appenders: {
          logstash: {
            type: "@log4js-node/logstash-http",
            url: `http://${config.logstashHost}:${config.logstashPort}/_bulk`,
            application: "logstash-log4js",
            logType: "application",
            logChannel: config.functionName,
          },
        },
        categories: {
          default: { appenders: ["logstash"], level: "info" },
        },
      });

      return new LoggerService(config, log4js.getLogger());
    }

    return new LoggerService(null, console);
  }

  timeStamp(): string {
    const dateObj = new Date();

    let date = dateObj.toISOString();
    date = date.substring(0, date.indexOf("T"));

    const time = dateObj.toLocaleTimeString([], { hour12: false });

    return `${date} ${time}`;
  }

  messageStamp(serviceOperation?: string): string {
    return `[${this.timeStamp()}][${this.functionName}${
      serviceOperation ? " - " + serviceOperation : ""
    }]`;
  }

  trace(message: string, serviceOperation?: string): void {
    this.logger.trace(
      `${this.messageStamp(serviceOperation)}[TRACE] - ${message}`
    );
  }

  log(message: string, serviceOperation?: string): void {
    this.logger.info(
      `${this.messageStamp(serviceOperation)}[INFO] - ${message}`
    );
  }

  warn(message: string, serviceOperation?: string): void {
    this.logger.warn(
      `${this.messageStamp(serviceOperation)}[WARN] - ${message}`
    );
  }

  error(
    message: string | Error,
    innerError?: unknown,
    serviceOperation?: string
  ): void {
    let errMessage = typeof message === "string" ? message : message.stack;

    if (innerError && innerError instanceof Error) {
      errMessage += `\r\n${innerError.message}${
        innerError.stack ? "\r\n" + innerError.stack : ""
      }`;
    }

    this.logger.error(
      `${this.messageStamp(serviceOperation)}[ERROR] - ${errMessage}`
    );
  }
}
