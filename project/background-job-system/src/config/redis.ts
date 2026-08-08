import Redis from "ioredis";
import { logger } from "../logger/index.js";
import { env } from "./env.js";

export const redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,

    maxRetriesPerRequest: null,
});

redis.on("connect", () => {
    logger.info("✅ Redis Connected");
});

redis.on("ready", () => {
    logger.info("✅ Redis Ready");
});

redis.on("error", (error:any) => {
    logger.error(error);
});

redis.on("close", () => {
    logger.warn("Redis Connection Closed");
});