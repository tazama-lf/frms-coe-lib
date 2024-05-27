// SPDX-License-Identifier: Apache-2.0

import protobuf from 'protobufjs';
import path from 'node:path';
import { type LogMessage as LogMessageType } from './proto/lumberjack/LogMessage';
const root = protobuf.loadSync(path.join(__dirname, '/proto/Full.proto'));
const FRMSMessage = root.lookupType('FRMSMessage');

const log = protobuf.loadSync(path.join(__dirname, '/proto/Lumberjack.proto'));
const LogMessage = log.lookupType('LogMessage');

/**
 * Create a Message `Buffer` derived from a byte array resulting from the input type
 *
 * @param {Record<string, unknown>} data The object to serialise to a `Buffer`
 * @returns {Buffer | undefined} The resulting `Buffer`, or `undefined` if an error occured
 */
export const createMessageBuffer = (data: Record<string, unknown>): Buffer | undefined => {
  try {
    const msg = FRMSMessage.create(data);
    const enc = FRMSMessage.encode(msg).finish() as Buffer;
    return enc;
  } catch (error) {
    return undefined;
  }
};

/**
 * Create a Log `Buffer` derived from a byte array resulting from the input type
 *
 * @param {Record<string, unknown>} data The object to serialise to a `Buffer`
 * @returns {Buffer | undefined} The resulting `Buffer`, or `undefined` if an error occured
 */
export const createLogBuffer = (data: Record<string, unknown>): Buffer | undefined => {
  try {
    const msg = LogMessage.create(data);
    const enc = LogMessage.encode(msg).finish() as Buffer;
    return enc;
  } catch (error) {
    return undefined;
  }
};

/**
 * Decodes a Log `Buffer` derived from a byte array resulting in a concrete `LogMessage` type
 *
 * @param {Buffer} buffer The byte array to decode to a `LogMessage`
 * @returns {LogMessage | undefined} The resulting `LogMessage`, or `undefined` if an error occured
 */
export const decodeLogBuffer = (buffer: Buffer): LogMessageType | undefined => {
  const decodedMessage = LogMessage.decode(buffer);
  return LogMessage.toObject(decodedMessage);
};

export default FRMSMessage;
