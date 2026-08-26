import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

const url = redisPassword
  ? `redis://:${redisPassword}@${redisHost}:${redisPort}`
  : `redis://${redisHost}:${redisPort}`;

export const redisClient = createClient({
  url,
  socket: {
    connectTimeout: 3000,
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        return new Error('Redis max retries reached');
      }
      return Math.min(retries * 100, 2000);
    }
  }
});

let isRedisConnected = false;
let fallbackVisitCount = 0;

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis server.');
  isRedisConnected = true;
});

redisClient.on('error', (err) => {
  if (isRedisConnected) {
    console.warn('⚠️ Redis error:', err.message);
  }
  isRedisConnected = false;
});

export async function initRedis() {
  try {
    await redisClient.connect();
    isRedisConnected = true;
    return true;
  } catch (error) {
    console.warn('⚠️ Redis connection failed:', error.message);
    console.warn('💡 Ensure Redis server is running locally (e.g. `redis-server`). Standard fallback counter will be used until connected.');
    isRedisConnected = false;
    return false;
  }
}

export function getRedisStatus() {
  return isRedisConnected;
}

export async function incrementVisits() {
  if (isRedisConnected && redisClient.isOpen) {
    try {
      const count = await redisClient.incr('visits_count');
      return { count: parseInt(count, 10), source: 'Redis' };
    } catch (e) {
      console.warn('Error incrementing Redis visit count:', e.message);
    }
  }
  fallbackVisitCount += 1;
  return { count: fallbackVisitCount, source: 'Memory (Redis Disconnected)' };
}

export async function getVisits() {
  if (isRedisConnected && redisClient.isOpen) {
    try {
      const count = await redisClient.get('visits_count');
      return { count: count ? parseInt(count, 10) : 0, source: 'Redis' };
    } catch (e) {
      console.warn('Error reading Redis visit count:', e.message);
    }
  }
  return { count: fallbackVisitCount, source: 'Memory (Redis Disconnected)' };
}
