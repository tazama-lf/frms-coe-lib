import Pain013Schema from './pain013.json';
export const pain013Schema = Pain013Schema;
export const pain013SchemaResponse = {
  '2xx': {
    type: 'object',
    properties: {
      message: {
        type: 'string',
      },
      data: { $ref: 'pain013Schema#' },
    },
    required: ['message', 'data'],
  },
};
