// SPDX-License-Identifier: Apache-2.0

// Original file: src/helpers/proto/Lumberjack.proto

export const LogLevel = {
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'fatal',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LogLevel = 'trace' | 0 | 'debug' | 1 | 'info' | 2 | 'warn' | 3 | 'error' | 4 | 'fatal' | 5;

export type LogLevel__Output = (typeof LogLevel)[keyof typeof LogLevel];
