import Redis from "ioredis";
import { RedisConfig } from "../interfaces/config";
import { LoggerService } from "./logger";

export class RedisService {
  private readonly client: Redis;
  private readonly logger: LoggerService;

  private constructor(config: RedisConfig, logger: LoggerService) {
    this.logger = logger;

    this.client = new Redis({
      db: config?.db,
      host: config?.host,
      port: config?.port,
      password: config?.password,
    });
  }

  private async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        this.logger.log("✅ Redis connection is ready");
        resolve();
      });
      this.client.on("error", (error) => {
        this.logger.error("❌ Redis connection is not ready", error);
        reject(new Error("Error connecting to redis"));
      });
    });
  }

  public static async create(
    config: RedisConfig,
    logger: LoggerService
  ): Promise<RedisService> {
    const redisInstance = new RedisService(config, logger);
    await redisInstance.init();
    return redisInstance;
  }

  getJson = (key: string): Promise<string[]> =>
    new Promise((resolve) => {
      this.client.smembers(key, (err, res) => {
        if (err) {
          this.logger.error(
            "Error while getting key from redis with message:",
            err,
            "RedisService"
          );

          resolve([]);
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
          this.logger.error(
            "Error while setting key in redis with message:",
            err,
            "RedisService"
          );

          resolve(undefined);
        }
        resolve(res);
      });
    });

  deleteKey = (key: string): Promise<number> =>
    new Promise((resolve) => {
      this.client.del(key, (err, res) => {
        if (err) {
          this.logger.error(
            "Error while deleting key from redis with message:",
            err,
            "RedisService"
          );

          resolve(0);
        }
        resolve(res as number);
      });
    });

  quit = (): void => {
    this.client.quit();
  };
}
