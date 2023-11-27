// Original file: src/helpers/proto/Lumberjack.proto

import type { LogLevel as _message_LogLevel, LogLevel__Output as _message_LogLevel__Output } from '../message/LogLevel';

export interface LogMessage {
  message?: string;
  level?: _message_LogLevel;
  channel?: string;
}

export interface LogMessage__Output {
  message: string;
  level: _message_LogLevel__Output;
  channel: string;
}
