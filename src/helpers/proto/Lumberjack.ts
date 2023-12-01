import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type {
  LumberjackClient as _lumberjack_LumberjackClient,
  LumberjackDefinition as _lumberjack_LumberjackDefinition,
} from './lumberjack/Lumberjack';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = new (
  ...args: ConstructorParameters<Constructor>
) => Subtype;

export interface ProtoGrpcType {
  google: {
    protobuf: {
      Empty: MessageTypeDefinition;
    };
  };
  lumberjack: {
    LogLevel: EnumTypeDefinition;
    LogMessage: MessageTypeDefinition;
    Lumberjack: SubtypeConstructor<typeof grpc.Client, _lumberjack_LumberjackClient> & { service: _lumberjack_LumberjackDefinition };
  };
}
