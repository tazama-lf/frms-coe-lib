import Redis from 'ioredis';
export class RedisService {
  _client: Redis;

  private constructor(config: RedisConfig) {
    this._client = new Redis({
      db: config?.db,
      host: config?.host,
      port: config?.port,
      password: config?.password,
    });
  }

  private async init(): Promise<string> {
    return await new Promise((resolve, reject) => {
      this._client.on('connect', () => {
        resolve('✅ Redis connection is ready');
      });
      this._client.on('error', () => {
        reject(new Error('❌ Redis connection could not be established'));
      });
    });
  }

  /**
   * Create an instance of a ready to use RedisService
   *
   * @param {RedisConfig} config the required config to start a connection to Redis
   * @return {Promise<RedisService>}
   */
  static async create(config: RedisConfig): Promise<RedisService> {
    const redisInstance = new RedisService(config);
    await redisInstance.init();
    return redisInstance;
  }

  getJson = async (key: string): Promise<string[]> =>
    await new Promise((resolve) => {
      this._client.smembers(key, (err, res) => {
        if (err != null) {
          throw new Error('Error while getting key from redis with message', err);
        }
        resolve(res ?? ['']);
      });
    });

  setJson = async (key: string, value: string, expire: number): Promise<'OK' | undefined> =>
    await new Promise((resolve) => {
      this._client.set(key, value, 'EX', expire, (err, res) => {
        if (err != null) {
          throw new Error('Error while setting key in redis with message', err);
        }
        resolve(res);
      });
    });

  deleteKey = async (key: string): Promise<number> =>
    await new Promise((resolve) => {
      this._client.del(key, (err, res) => {
        if (err != null) {
          throw new Error('Error while deleting key from redis with message', err);
        }
        resolve(res as number);
      });
    });

  quit = (): void => {
    this._client.disconnect();
  };
}

export interface RedisConfig {
  db: number;
  host: string;
  port: number;
  password: string;
}
