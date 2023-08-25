import Pacs002Schema from './pacs002.json';
export const pacs002Schema = Pacs002Schema;
export const pacs002SchemaResponse = {
  '2xx': {
    type: 'object',
    properties: {
      message: {
        type: 'string',
      },
      data: { $ref: 'pacs002Schema#' },
    },
    required: ['message', 'data'],
  },
};
