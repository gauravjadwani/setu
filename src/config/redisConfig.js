const redis = require('ioredis');

let redisClient
try{
    redisClient = new redis()
    console.log("redis connected")
}catch(e){
    console.error("redis failed",e)
}


module.exports = redisClient;


