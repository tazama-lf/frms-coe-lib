import protobuf from 'protobufjs';
const root = protobuf.loadSync('./proto/Full.proto');
const FRMSMessage = root.lookupType('FRMSMessage');
export default FRMSMessage;
