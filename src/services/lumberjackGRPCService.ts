// SPDX-License-Identifier: Apache-2.0

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'node:path';
import type { LumberjackClient } from '../helpers/proto/lumberjack/Lumberjack';
import type { LogLevel } from '../helpers/proto/lumberjack/LogLevel';
import type { LogMessage } from '../helpers/proto/lumberjack/LogMessage';

const PROTO_PATH = path.join(__dirname, '../helpers/proto/Lumberjack.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const LogProto = (grpc.loadPackageDefinition(packageDefinition).lumberjack as grpc.GrpcObject).Lumberjack as grpc.ServiceClientConstructor;

export class LumberjackGRPCService {
  readonly client: LumberjackClient;
  readonly channel: string;
  constructor(host: string, channel: string) {
    this.client = new LogProto(host, grpc.credentials.createInsecure()) as unknown as LumberjackClient;
    this.channel = channel;
  }

  makeMessage(message: string, level?: LogLevel, serviceOperation?: string, id?: string): LogMessage {
    return {
      message,
      level,
      channel: this.channel,
      serviceOperation,
      id,
    };
  }

  log(message: string, level?: LogLevel, serviceOperation?: string, id?: string, callback?: (...args: unknown[]) => unknown): void {
    const object = this.makeMessage(message, level, serviceOperation, id);
    if (callback) {
      this.client.sendLog(object, callback);
    } else {
      this.client.sendLog(object, () => {
        // no callback provided
      });
    }
  }
}
