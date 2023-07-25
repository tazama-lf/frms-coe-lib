export interface RedisConfig {
  db: number;
  servers: Array<{
    host: string;
    port: number;
  }>;
  password: string;
  isCluster: boolean;
}
