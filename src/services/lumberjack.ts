import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { type LogMessage } from '../helpers/proto/message/LogMessage';
import path from 'node:path';
import type { LogLevel } from '../helpers/proto/message/LogLevel';

const PROTO_PATH = path.join(__dirname, '../helpers/proto/Lumberjack.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logProto: any = grpc.loadPackageDefinition(packageDefinition).message;

export class LumberjackService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #client: any;
  #channel: string;
  constructor(host: string, channel: string) {
    this.#client = new logProto.Lumberjack(host, grpc.credentials.createInsecure());
    this.#channel = channel;
  }

  #makeMessage(message: string, level?: LogLevel): LogMessage {
    return {
      message,
      level,
      channel: this.#channel,
    };
  }

  log(message: string, level?: LogLevel, callback?: (...args: unknown[]) => unknown): void {
    const object = this.#makeMessage(message, level);
    if (callback) {
      this.#client.sendLog(object, callback);
    } else {
      this.#client.sendLog(object, () => {
        // no callback provided
      });
    }
  }
}
