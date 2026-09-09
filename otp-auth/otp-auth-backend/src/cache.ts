import { createClient } from 'redis';

// Create a Redis client
const redisClient = createClient({
  url: 'redis://localhost:6379', // Default Redis URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis
redisClient.connect();

export default redisClient;
