const redis = require('ioredis');

// // Create Redis client
// const redisClient = redis.createClient({
//     host: 'redis',  // Adjust as per your Docker setup or local environment
//     port: 6379
// });
// redisClient.connect()
// // Handle Redis connection events (optional)
// redisClient.on('connect', () => {
//     console.log('Connected to Redis...');
// });

// redisClient.on('error', (err) => {
//     console.error('Redis connection error:', err);
// });
let redisClient
try{
    redisClient = new redis()
    console.log("redis connected")
}catch(e){
    console.error("redis failed",e)
}

// // Export the Redis client
module.exports = redisClient;


