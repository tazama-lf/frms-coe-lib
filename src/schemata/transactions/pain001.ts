import Pain001Schema from './pain001Schema.json';
export const pain001Schema = Pain001Schema;
export const pain001SchemaResponse = {
  '2xx': {
    type: 'object',
    properties: {
      message: {
        type: 'string',
      },
      data: { $ref: 'pain001Schema#' },
    },
    required: ['message', 'data'],
  },
};
