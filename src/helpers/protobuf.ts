import protobuf from 'protobufjs';
import path from 'node:path';
const root = protobuf.loadSync(path.join(__dirname, '/proto/Full.proto'));
const FRMSMessage = root.lookupType('FRMSMessage');
export default FRMSMessage;
