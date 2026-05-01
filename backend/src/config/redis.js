import redis from 'redis';
import logger from '../utils/logger.js';

let redisClient;

export const initializeRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    redisClient.on('error', (err) => logger.error('Redis error:', err));
    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('reconnecting', () => logger.info('Redis reconnecting...'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Redis initialization failed:', error);
    throw error;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client is not initialized');
  }
  return redisClient;
};

export const cache = {
  get: async (key) => {
    const value = await getRedisClient().get(key);
    return value ? JSON.parse(value) : null;
  },

  set: async (key, value, ttl = 3600) => {
    await getRedisClient().setEx(key, ttl, JSON.stringify(value));
  },

  del: async (key) => {
    await getRedisClient().del(key);
  },

  clear: async () => {
    await getRedisClient().flushDb();
  },
};
