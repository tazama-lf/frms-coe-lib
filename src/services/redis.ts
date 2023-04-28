import Redis from "ioredis";

export class RedisService {
  private readonly client: Redis;

  private constructor(config: RedisConfig) {
    this.client = new Redis({
      db: config?.db,
      host: config?.host,
      port: config?.port,
      password: config?.password,
    });
  }

  private async init(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        resolve("✅ Redis connection is ready");
      });
      this.client.on("error", (error) => {
        reject(new Error("❌ Redis connection is not ready"));
      });
    });
  }

  /**
  * Create an instance of a ready to use RedisService
  *
  * @param {RedisConfig} config the required config to start a connection to Redis
  * @return {Promise<RedisService>}
  */
  static async create(
    config: RedisConfig
  ): Promise<RedisService> {
    const redisInstance = new RedisService(config);
  
    await redisInstance.init();
    return redisInstance;
  }

  getJson = (key: string): Promise<string[]> =>
    new Promise((resolve) => {
      this.client.smembers(key, (err, res) => {
        if (err) {
          throw new Error(`Error while getting key from redis with message: ${err}`)
        }
        resolve(res ?? [""]);
      });
    });

  setJson = (
    key: string,
    value: string,
    expire: number
  ): Promise<"OK" | undefined> =>
    new Promise((resolve) => {
      this.client.set(key, value, "EX", expire, (err, res) => {
        if (err) {
          throw new Error(`Error while setting key in redis with message: ${err}`)
        }
        resolve(res);
      });
    });

  deleteKey = (key: string): Promise<number> =>
    new Promise((resolve) => {
      this.client.del(key, (err, res) => {
        if (err) {
          throw new Error(`Error while deleting key from redis with message: ${err}`)
        }
        resolve(res as number);
      });
    });

  quit = (): void => {
    this.client.quit();
  };
}

export interface RedisConfig {
  db: number;
  host: string;
  port: number;
  password: string;
}
