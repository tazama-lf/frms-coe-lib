import { RedisService } from '..';
import { type RedisConfig } from '../interfaces';
import { type DatabaseManagerType, readyChecks } from '../services/dbManager';

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
    readyChecks.Redis = 'Ok';

    return redis;
  } catch (error) {
    readyChecks.Redis = error;
  }
}
