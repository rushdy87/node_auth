// init_redis.js
const redis = require("redis");

const client = redis.createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

client.on("connect", () => {
  console.log("Connected to Redis server.");
});

client.on("ready", () => {
  console.log("Redis server is ready to use.");
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

client.on("end", () => {
  console.log("Redis connection closed.");
});

process.on("SIGINT", () => {
  client.quit();
});

const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
};

module.exports = connectRedis;
