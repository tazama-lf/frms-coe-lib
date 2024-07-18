// SPDX-License-Identifier: Apache-2.0

import Redis, { type Cluster } from 'ioredis';
import { type RedisConfig } from '../interfaces/RedisConfig';
import FRMSMessage from '../helpers/protobuf';

type RedisData = string | number | Buffer;
const MAX_RETRIES = 10;
const RECONNECT_DELAY_MS = 500;

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
        clusterRetryStrategy(times) {
          if (times >= MAX_RETRIES) {
            return null;
          }
          return RECONNECT_DELAY_MS;
        },
      });
    } else {
      this._redisClient = new Redis({
        db: config?.db,
        host: config?.servers[0].host,
        port: config?.servers[0].port,
        password: config?.password,
        retryStrategy(times) {
          if (times >= MAX_RETRIES) {
            return null;
          }
          return RECONNECT_DELAY_MS;
        },
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

      this._redisClient.on('end', () => {
        throw new Error('❓ Redis connection lost, no more reconnections will be made');
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

  async getBuffer(key: string): Promise<Record<string, unknown>> {
    try {
      const res = await this._redisClient.getBuffer(key);
      if (res === null) {
        return {};
      }
      const decodedReport = FRMSMessage.decode(res);
      return FRMSMessage.toObject(decodedReport);
    } catch (err) {
      throw new Error(`Error while getting ${key} from Redis`);
    }
  }

  /**
   * Get the members of a Redis set stored under the given key.
   *
   * @param {string} key The key associated with the Redis set.
   * @returns {Promise<Record<string, unknown>[]>} A Promise that resolves to an array of set members as objects.
   */
  async getMemberValues(key: string): Promise<Array<Record<string, unknown>>> {
    try {
      const res = (await this._redisClient.smembersBuffer(key)) as Uint8Array[];
      const membersBuffer = res.map((member) => {
        const decodedMember = FRMSMessage.decode(member);
        return FRMSMessage.toObject(decodedMember);
      });

      if (!res || membersBuffer.length === 0) {
        return [];
      }

      return membersBuffer;
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
      throw new Error('Error while setting key in redis');
    }
  }

  /**
   * Store a value in Redis under the given key with an optional expiration time.
   *
   * Much like `setJson()`, but without the JSON restriction,
   * This version accepts `Buffer` and `number` times in addition
   */
  async set(key: string, value: RedisData, expire: number): Promise<void> {
    const res = await this._redisClient.set(key, value, 'EX', expire);

    if (res !== 'OK') {
      throw new Error('Error while setting key in redis');
    }
  }

  /**
   * Add a value to a Redis set under the given key.
   *
   * @param {string} key The key associated with the Redis set.
   * @param {RedisData} value The value to add to the Redis set.
   * @returns {Promise<void>} A Promise that resolves when the value is successfully added to the set.
   */
  async setAdd(key: string, value: Record<string, unknown>): Promise<void> {
    const valueMessage = FRMSMessage.create(value);
    const valueBuffer = FRMSMessage.encode(valueMessage).finish() as Buffer;
    const res = await this._redisClient.sadd(key, valueBuffer);
    if (res === 0) {
      throw new Error(`Member already exists for key ${key}`);
    }
  }

  /**
   * Add a value to a Redis set and then return all members from that set.
   *
   * @param {string} key The key associated with the Redis set.
   * @param {Record<string, unknown>} value The value to add to the Redis set.
   * @returns {Promise<string[]>} A Promise that resolves to an array of set members as strings.
   */
  async addOneGetAll(key: string, value: Record<string, unknown>): Promise<Array<Record<string, unknown>>> {
    try {
      const valueMessage = FRMSMessage.create(value);
      const valueBuffer = FRMSMessage.encode(valueMessage).finish() as Buffer;
      const res = await this._redisClient.multi().sadd(key, valueBuffer).smembersBuffer(key).exec();
      const result = res ? (res[1][1] as Uint8Array[]) : undefined;

      const membersBuffer = result?.map((member) => {
        const decodedMember = FRMSMessage.decode(member);
        return FRMSMessage.toObject(decodedMember);
      });

      if (!res || membersBuffer?.length === 0) {
        return [];
      }

      return membersBuffer as Array<Record<string, unknown>>;
    } catch (err) {
      throw new Error(`Error while getting members on ${key} from Redis`);
    }
  }

  /**
   * Add a value to a Redis set and then return number of members in the set after the addition.
   *
   * @param {string} key The key associated with the Redis set.
   * @param {Record<string, unknown>} value The value to add to the Redis set.
   * @returns {Promise<string[]>} A Promise that resolves to an array of set members as strings.
   */
  async addOneGetCount(key: string, value: Record<string, unknown>): Promise<number> {
    const valueMessage = FRMSMessage.create(value);
    const valueBuffer = FRMSMessage.encode(valueMessage).finish() as Buffer;
    const res = await this._redisClient.multi().sadd(key, valueBuffer).scard(key).exec();

    if (res && res[1] && res[1][1]) {
      return res[1][1] as number;
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
