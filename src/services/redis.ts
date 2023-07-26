import Redis, { type Cluster } from 'ioredis';
import { type RedisConfig } from '../interfaces/RedisConfig';
export class RedisService {
  public _redisClient: Redis | Cluster;

  private constructor(config: RedisConfig) {
    if (config.isCluster) {
      this._redisClient = new Redis.Cluster(config.servers, {
        scaleReads: 'all',
        redisOptions: {
          db: config?.db,
          password: config?.password,
          enableAutoPipelining: true,
        },
      });
    } else {
      this._redisClient = new Redis({
        db: config?.db,
        host: config?.servers[0].host,
        port: config?.servers[0].port,
        password: config?.password,
      });
    }
  }

  private async init(): Promise<string> {
    return await new Promise((resolve, reject) => {
      this._redisClient.on('connect', () => {
        resolve('✅ Redis connection is ready');
      });

      this._redisClient.on('error', (err) => {
        reject(new Error(`❌ Redis connection could not be established\n${JSON.stringify(err)}`));
      });
    });
  }

  /**
   * Create an instance of a ready to use RedisService
   *
   * @param {RedisConfig} config The required config to start a connection to Redis
   * @return {Promise<RedisService>} A Promise that resolves to a RedisService instance.
   */
  static async create(config: RedisConfig): Promise<RedisService> {
    const redisInstance = new RedisService(config);
    await redisInstance.init();
    return redisInstance;
  }

  /**
   * Get the value stored as JSON for the given key from Redis.
   *
   * @param {string} key The key associated with the JSON value to retrieve.
   * @returns {Promise<string>} A Promise that resolves to the JSON value as a string.
   */
  async getJson(key: string): Promise<string> {
    try {
      const res = await this._redisClient.get(key);
      if (res === null) {
        return '';
      }

      return res;
    } catch (err) {
      throw new Error(`Error while getting ${key} from Redis`);
    }
  }

  /**
   * Get the members of a Redis set stored under the given key.
   *
   * @param {string} key The key associated with the Redis set.
   * @returns {Promise<string[]>} A Promise that resolves to an array of set members as strings.
   */
  async getMembers(key: string): Promise<string[]> {
    try {
      const res = await this._redisClient.smembers(key);
      if (!res || res.length === 0) {
        return [];
      }

      return res;
    } catch (err) {
      throw new Error(`Error while getting members on ${key} from Redis`);
    }
  }

  /**
   * Delete the entry associated with the given key from Redis.
   *
   * @param {string} key The key to be deleted from Redis.
   * @returns {Promise<void>} A Promise that resolves when the key is successfully deleted.
   */
  async deleteKey(key: string): Promise<void> {
    try {
      await this._redisClient.del(key);
    } catch (err) {
      throw new Error(`Error while deleting ${key} from Redis`);
    }
  }

  /**
   * Store a JSON value in Redis under the given key with an optional expiration time.
   *
   * @param {string} key The key to associate with the JSON value in Redis.
   * @param {string} value The JSON value to store in Redis.
   * @param {number} expire The expiration time for the key (in seconds). Use 0 for no expiration.
   * @returns {Promise<void>} A Promise that resolves when the JSON value is successfully stored in Redis.
   */
  async setJson(key: string, value: string, expire: number): Promise<void> {
    const res = await this._redisClient.set(key, value, 'EX', expire);

    if (res !== 'OK') {
      throw new Error(`Error while setting key in redis`);
    }
  }

  /**
   * Add a value to a Redis set under the given key.
   *
   * @param {string} key The key associated with the Redis set.
   * @param {string} value The value to add to the Redis set.
   * @returns {Promise<void>} A Promise that resolves when the value is successfully added to the set.
   */
  async setAdd(key: string, value: string): Promise<void> {
    const res = await this._redisClient.sadd(key, value);
    if (res === 0) {
      throw new Error(`Member already exists for key ${key}`);
    }
  }

  /**
   * Add a value to a Redis set and then return all members from that set.
   *
   * @param {string} key The key associated with the Redis set.
   * @param {string} value The value to add to the Redis set.
   * @returns {Promise<string[]>} A Promise that resolves to an array of set members as strings.
   */
  async addOneGetAll(key: string, value: string): Promise<string[]> {
    const res = await this._redisClient.multi().sadd(key, value).smembers(key).exec();

    if (res && res[1] && res[1][1]) {
      return res[1][1] as string[];
    } else {
      throw new Error('addOneGetAll failed to return properly');
    }
  }

  /**
   * Close the Redis connection and release associated resources.
   */
  quit(): void {
    this._redisClient.quit();
  }
}
