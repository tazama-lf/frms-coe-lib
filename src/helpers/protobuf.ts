// SPDX-License-Identifier: Apache-2.0

import protobuf from 'protobufjs';
import path from 'node:path';
import { type LogMessage as LogMessageType } from './proto/lumberjack/LogMessage';
import { type ConditionResponse } from '../interfaces/event-flow/ConditionDetails';

const root = protobuf.loadSync(path.join(__dirname, '/proto/Full.proto'));
const FRMSMessage = root.lookupType('FRMSMessage');

const log = protobuf.loadSync(path.join(__dirname, '/proto/Lumberjack.proto'));
const LogMessage = log.lookupType('LogMessage');

const conditions = protobuf.loadSync(path.join(__dirname, '/proto/EFRuP.proto'));
const ConditionsMessage = conditions.lookupType('Conditions');

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
 * Create a ConditionResponse `Buffer` derived from a byte array resulting from the input type
 *
 * @param {ConditionResponse} data The object to serialise to a `Buffer`
 * @returns {Buffer | undefined} The resulting `Buffer`, or `undefined` if an error occured
 */
export const createConditionsBuffer = (data: ConditionResponse): Buffer | undefined => {
  try {
    const msg = ConditionsMessage.create(data);
    const enc = ConditionsMessage.encode(msg).finish() as Buffer;
    return enc;
  } catch (error) {
    return undefined;
  }
};

/**
 * Decodes a ConditionResponse `Buffer` derived from a byte array resulting from the input type
 *
 * @param {Buffer} buffer The byte array to decode to a `ConditionResponse`
 * @returns {ConditionResponse | undefined} The resulting `ConditionResponse`, or `undefined` if an error occured
 */
export const decodeConditionsBuffer = (buffer: Buffer): ConditionResponse | undefined => {
  const decodedMessage = ConditionsMessage.decode(buffer);
  return ConditionsMessage.toObject(decodedMessage) as ConditionResponse;
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
