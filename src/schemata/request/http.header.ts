export const requestHeaderSchema = {
  $id: 'requestHeaderSchema',
  type: 'object',
  properties: {
    'content-type': {
      type: 'string',
    },
    'user-agent': {
      type: 'string',
    },
    accept: {
      type: 'string',
    },
    'cache-control': {
      type: 'string',
    },
    'postman-token': {
      type: 'string',
    },
    host: {
      type: 'string',
    },
    'accept-encoding': {
      type: 'string',
    },
    connection: {
      type: 'string',
    },
    'content-length': {
      type: 'string',
    },
  },
  required: ['content-type', 'accept', 'cache-control', 'host', 'accept-encoding', 'connection', 'content-length'],
};

export const responseHeaderSchema = {
  sas: '',
};
