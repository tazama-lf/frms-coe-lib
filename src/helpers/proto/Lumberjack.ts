import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type {
  LumberjackClient as _message_LumberjackClient,
  LumberjackDefinition as _message_LumberjackDefinition,
} from './message/Lumberjack';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = new (
  ...args: ConstructorParameters<Constructor>
) => Subtype;

export interface ProtoGrpcType {
  google: {
    protobuf: {
      Empty: MessageTypeDefinition;
    };
  };
  message: {
    LogLevel: EnumTypeDefinition;
    LogMessage: MessageTypeDefinition;
    Lumberjack: SubtypeConstructor<typeof grpc.Client, _message_LumberjackClient> & { service: _message_LumberjackDefinition };
  };
}
