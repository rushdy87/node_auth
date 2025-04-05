const redis = require("redis");

const client = redis.createClient({
  port: 6379, // Redis server port
  host: "127.0.0.1", // Redis server host
});

client.on("connect", () => {
  console.log("Connected to Redis server.");
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

client.on("ready", () => {
  console.log("Redis server is ready to use.");
});

client.on("end", () => {
  console.log("Redis connection closed.");
});

process.on("SIGINT", () => {
  client.quit();
});

(async () => {
  await client.connect(); // <-- Important in Redis v4+
})();

module.exports = client;
