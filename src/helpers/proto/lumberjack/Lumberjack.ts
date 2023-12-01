// Original file: src/helpers/proto/Lumberjack.proto

import type * as grpc from '@grpc/grpc-js';
import type { MethodDefinition } from '@grpc/proto-loader';
import type { Empty as _google_protobuf_Empty, Empty__Output as _google_protobuf_Empty__Output } from '../google/protobuf/Empty';
import type { LogMessage as _lumberjack_LogMessage, LogMessage__Output as _lumberjack_LogMessage__Output } from '../lumberjack/LogMessage';

export interface LumberjackClient extends grpc.Client {
  SendLog: ((
    argument: _lumberjack_LogMessage,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
  ) => grpc.ClientUnaryCall) &
    ((
      argument: _lumberjack_LogMessage,
      metadata: grpc.Metadata,
      callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
    ) => grpc.ClientUnaryCall) &
    ((
      argument: _lumberjack_LogMessage,
      options: grpc.CallOptions,
      callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
    ) => grpc.ClientUnaryCall) &
    ((argument: _lumberjack_LogMessage, callback: grpc.requestCallback<_google_protobuf_Empty__Output>) => grpc.ClientUnaryCall);
  sendLog: ((
    argument: _lumberjack_LogMessage,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
  ) => grpc.ClientUnaryCall) &
    ((
      argument: _lumberjack_LogMessage,
      metadata: grpc.Metadata,
      callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
    ) => grpc.ClientUnaryCall) &
    ((
      argument: _lumberjack_LogMessage,
      options: grpc.CallOptions,
      callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
    ) => grpc.ClientUnaryCall) &
    ((argument: _lumberjack_LogMessage, callback: grpc.requestCallback<_google_protobuf_Empty__Output>) => grpc.ClientUnaryCall);
}

export interface LumberjackHandlers extends grpc.UntypedServiceImplementation {
  SendLog: grpc.handleUnaryCall<_lumberjack_LogMessage__Output, _google_protobuf_Empty>;
}

export interface LumberjackDefinition extends grpc.ServiceDefinition {
  SendLog: MethodDefinition<_lumberjack_LogMessage, _google_protobuf_Empty, _lumberjack_LogMessage__Output, _google_protobuf_Empty__Output>;
}
