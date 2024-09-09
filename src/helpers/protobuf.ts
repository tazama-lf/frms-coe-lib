// SPDX-License-Identifier: Apache-2.0

import protobuf from 'protobufjs';
import path from 'node:path';
import { type LogMessage as LogMessageType } from './proto/lumberjack/LogMessage';
import { type AccountConditionResponse, type EntityConditionResponse } from '../interfaces/event-flow/ConditionDetails';

const root = protobuf.loadSync(path.join(__dirname, '/proto/Full.proto'));
const FRMSMessage = root.lookupType('FRMSMessage');

const log = protobuf.loadSync(path.join(__dirname, '/proto/Lumberjack.proto'));
const LogMessage = log.lookupType('LogMessage');

const conditions = protobuf.loadSync(path.join(__dirname, '/proto/EFRuP.proto'));
const ConditionsMessage = conditions.lookupType('Conditions');
const CacheConditionsMessage = conditions.lookupType('CacheConditions');

/**
 * Create a Message `Buffer` derived from a byte array resulting from the input type
 *
 * @param {Record<string, unknown>} data The object to serialise to a `Buffer`
 * @returns {Buffer | undefined} The resulting `Buffer`, or `undefined` if an error occurred
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
 * @returns {Buffer | undefined} The resulting `Buffer`, or `undefined` if an error occurred
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
 * Create a  AccountConditionResponse | EntityConditionResponse `Buffer` derived from a byte array resulting from the input type
 *
 * @param { AccountConditionResponse | EntityConditionResponse} data The object to serialise to a `Buffer`
 * @returns {Buffer | undefined} The resulting `Buffer`, or `undefined` if an error occurred
 */
export const createConditionsBuffer = (data: AccountConditionResponse | EntityConditionResponse): Buffer | undefined => {
  try {
    const msg = ConditionsMessage.create(data);
    const enc = ConditionsMessage.encode(msg).finish() as Buffer;
    return enc;
  } catch (error) {
    return undefined;
  }
};

/**
 * Create a  Cache `Buffer` for conditions derived from a byte array resulting from the input type
 *
 * @param data The object to serialise to a `Buffer`
 * @returns {Buffer | undefined} The resulting `Buffer`, or `undefined` if an error occurred
 */
export const createCacheConditionsBuffer = (data: {
  account: AccountConditionResponse;
  entity: EntityConditionResponse;
}): Buffer | undefined => {
  try {
    const msg = CacheConditionsMessage.create(data);
    const enc = CacheConditionsMessage.encode(msg).finish() as Buffer;
    return enc;
  } catch (error) {
    return undefined;
  }
};

/**
 * Decodes a  AccountConditionResponse | EntityConditionResponse `Buffer` derived from a byte array resulting from the input type
 *
 * @param {Buffer} buffer The byte array to decode to a `AccountConditionResponse and EntityConditionResponse`
 * @returns { AccountConditionResponse | EntityConditionResponse | undefined} The resulting ` AccountConditionResponse | EntityConditionResponse`, or `undefined` if an error occurred
 */
export const decodeCacheConditionsBuffer = (buffer: Buffer): { account: AccountConditionResponse; entity: EntityConditionResponse } => {
  const decodedMessage = CacheConditionsMessage.decode(buffer);
  return CacheConditionsMessage.toObject(decodedMessage) as { account: AccountConditionResponse; entity: EntityConditionResponse };
};

/**
 * Decodes a  AccountConditionResponse | EntityConditionResponse `Buffer` derived from a byte array resulting from the input type
 *
 * @param {Buffer} buffer The byte array to decode to a `AccountConditionResponse | EntityConditionResponse`
 * @returns { AccountConditionResponse | EntityConditionResponse | undefined} The resulting ` AccountConditionResponse | EntityConditionResponse`, or `undefined` if an error occurred
 */
export const decodeConditionsBuffer = (buffer: Buffer): AccountConditionResponse | EntityConditionResponse | undefined => {
  const decodedMessage = ConditionsMessage.decode(buffer);
  return ConditionsMessage.toObject(decodedMessage) as AccountConditionResponse | EntityConditionResponse;
};

/**
 * Decodes a Log `Buffer` derived from a byte array resulting in a concrete `LogMessage` type
 *
 * @param {Buffer} buffer The byte array to decode to a `LogMessage`
 * @returns {LogMessage | undefined} The resulting `LogMessage`, or `undefined` if an error occurred
 */
export const decodeLogBuffer = (buffer: Buffer): LogMessageType | undefined => {
  const decodedMessage = LogMessage.decode(buffer);
  return LogMessage.toObject(decodedMessage);
};

export default FRMSMessage;
