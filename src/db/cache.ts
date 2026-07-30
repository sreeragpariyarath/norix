import type { DbEntry } from '../types.js';

export const cacheEntries: DbEntry[] = [
  { packages: ['ioredis'], label: 'Redis (ioredis)', role: 'redis-client' },
  { packages: ['redis'], label: 'Redis', role: 'redis-client' },
  { packages: ['@upstash/redis'], label: 'Upstash Redis', role: 'managed-cache' },
  { packages: ['node-cache'], label: 'node-cache', role: 'local-cache' },
  { packages: ['lru-cache'], label: 'LRU Cache', role: 'local-cache' },
  { packages: ['keyv'], label: 'Keyv', role: 'local-cache' },
  { packages: ['memcached'], label: 'Memcached', role: 'memcached-client' },
];
