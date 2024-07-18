// SPDX-License-Identifier: Apache-2.0

import { ecsFormat } from '@elastic/ecs-pino-format';
import { type LoggerOptions } from 'pino';
import pinoElastic, { type DestinationStream } from 'pino-elasticsearch';

interface ElasticLogger {
  stream: DestinationStream;
  ecsOpts: LoggerOptions;
}

export function createElasticStream(
  node: string,
  esVersion: number,
  username: string,
  password: string,
  flushBytes: number,
  index?: string,
): ElasticLogger {
  const streamToElastic = pinoElastic({
    index,
    node,
    esVersion,
    auth: {
      username,
      password,
    },
    flushBytes,
  });

  const elasticOpts = ecsFormat();
  return {
    stream: streamToElastic,
    ecsOpts: elasticOpts,
  };
}

export type LogCallback = (...args: unknown[]) => unknown;
