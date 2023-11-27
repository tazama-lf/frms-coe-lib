// Original file: src/helpers/proto/Lumberjack.proto

import type * as grpc from '@grpc/grpc-js';
import type { MethodDefinition } from '@grpc/proto-loader';
import type { Empty as _google_protobuf_Empty, Empty__Output as _google_protobuf_Empty__Output } from '../google/protobuf/Empty';
import type { LogMessage as _message_LogMessage, LogMessage__Output as _message_LogMessage__Output } from '../message/LogMessage';

export interface LumberjackClient extends grpc.Client {
  SendLog: ((
    argument: _message_LogMessage,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
  ) => grpc.ClientUnaryCall) &
    ((
      argument: _message_LogMessage,
      metadata: grpc.Metadata,
      callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
    ) => grpc.ClientUnaryCall) &
    ((
      argument: _message_LogMessage,
      options: grpc.CallOptions,
      callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
    ) => grpc.ClientUnaryCall) &
    ((argument: _message_LogMessage, callback: grpc.requestCallback<_google_protobuf_Empty__Output>) => grpc.ClientUnaryCall);
  sendLog: ((
    argument: _message_LogMessage,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
  ) => grpc.ClientUnaryCall) &
    ((
      argument: _message_LogMessage,
      metadata: grpc.Metadata,
      callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
    ) => grpc.ClientUnaryCall) &
    ((
      argument: _message_LogMessage,
      options: grpc.CallOptions,
      callback: grpc.requestCallback<_google_protobuf_Empty__Output>,
    ) => grpc.ClientUnaryCall) &
    ((argument: _message_LogMessage, callback: grpc.requestCallback<_google_protobuf_Empty__Output>) => grpc.ClientUnaryCall);
}

export interface LumberjackHandlers extends grpc.UntypedServiceImplementation {
  SendLog: grpc.handleUnaryCall<_message_LogMessage__Output, _google_protobuf_Empty>;
}

export interface LumberjackDefinition extends grpc.ServiceDefinition {
  SendLog: MethodDefinition<_message_LogMessage, _google_protobuf_Empty, _message_LogMessage__Output, _google_protobuf_Empty__Output>;
}
