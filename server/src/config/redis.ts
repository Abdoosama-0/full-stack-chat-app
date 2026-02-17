import 'dotenv/config';
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

// 🔑 مهم: الاتصال
(async () => {
  await redis.connect();
  redis.set("key", "value")
})();




export default redis;
