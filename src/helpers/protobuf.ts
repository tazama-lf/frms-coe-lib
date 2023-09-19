import protobuf from 'protobufjs';
import path from 'node:path';
const root = protobuf.loadSync(path.join(__dirname, '/proto/Full.proto'));
const FRMSMessage = root.lookupType('FRMSMessage');

/**
 * Create a `Buffer` derived from a byte array resulting from the input type
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

export default FRMSMessage;
