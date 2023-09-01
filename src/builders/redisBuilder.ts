import { RedisService } from '..';
import { formatError } from '../helpers/formatter';
import { type RedisConfig } from '../interfaces';
import { readyChecks, type DatabaseManagerType } from '../services/dbManager';

export async function redisBuilder(manager: DatabaseManagerType, redisConfig: RedisConfig): Promise<RedisService | undefined> {
  try {
    const redis = await RedisService.create(redisConfig);
    manager._redisClient = redis._redisClient;
    manager.getJson = redis.getJson;
    manager.getMembers = redis.getMembers;
    manager.deleteKey = redis.deleteKey;
    manager.setJson = redis.setJson;
    manager.setAdd = redis.setAdd;
    manager.addOneGetAll = redis.addOneGetAll;
    manager.addOneGetCount = redis.addOneGetCount;
    readyChecks.Redis = 'Ok';

    return redis;
  } catch (error) {
    const err = error as Error;
    readyChecks.Redis = `err, ${formatError(err)}`;
  }
}
