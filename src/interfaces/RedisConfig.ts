// SPDX-License-Identifier: Apache-2.0

export interface RedisConfig {
  db: number;
  servers: Array<{
    host: string;
    port: number;
  }>;
  password: string;
  isCluster: boolean;
  distributedCacheEnabled?: boolean;
  distributedCacheTTL?: number;
}
