// SPDX-License-Identifier: Apache-2.0

import * as util from 'node:util';
import { RedisService } from '..';
import type { RedisConfig } from '../interfaces';
import { readyChecks, type DatabaseManagerType } from '../services/dbManager';

export async function redisBuilder(manager: DatabaseManagerType, redisConfig: RedisConfig): Promise<RedisService | undefined> {
  try {
    const redis = await RedisService.create(redisConfig);
    manager._redisClient = redis._redisClient;
    manager.getJson = async (...args) => await redis.getJson(...args);
    manager.getBuffer = async (...args) => await redis.getBuffer(...args);
    manager.getMemberValues = async (...args) => await redis.getMemberValues(...args);
    manager.deleteKey = async (...args) => {
      await redis.deleteKey(...args);
    };
    manager.setJson = async (...args) => {
      await redis.setJson(...args);
    };
    manager.set = async (...args) => {
      await redis.set(...args);
    };
    manager.setAdd = async (...args) => {
      await redis.setAdd(...args);
    };
    manager.addOneGetAll = async (...args) => await redis.addOneGetAll(...args);
    manager.addOneGetCount = async (...args) => await redis.addOneGetCount(...args);
    readyChecks.Redis = 'Ok';

    return redis;
  } catch (error) {
    const err = error as Error;
    readyChecks.Redis = `err, ${util.inspect(err)}`;
  }
}
