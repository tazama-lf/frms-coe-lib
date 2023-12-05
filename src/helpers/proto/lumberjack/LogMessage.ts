// Original file: src/helpers/proto/Lumberjack.proto

import type { LogLevel as _lumberjack_LogLevel, LogLevel__Output as _lumberjack_LogLevel__Output } from '../lumberjack/LogLevel';

export interface LogMessage {
  message?: string;
  level?: _lumberjack_LogLevel;
  channel?: string;
  serviceOperation?: string;
  id?: string;
}

export interface LogMessage__Output {
  message: string;
  level: _lumberjack_LogLevel__Output;
  channel: string;
  serviceOperation: string;
  id: string;
}
