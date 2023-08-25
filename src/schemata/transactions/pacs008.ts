import Pacs008Schema from './pacs008Schema.json';
export const pacs008Schema = Pacs008Schema;
export const pacs008SchemaResponse = {
  '2xx': {
    type: 'object',
    properties: {
      message: {
        type: 'string',
      },
      data: { $ref: 'pacs008Schema#' },
    },
    required: ['message', 'data'],
  },
};
