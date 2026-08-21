import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const aggregationQueue = new Queue(
    "aggregation-queue",
    {
        connection: redis,
    }
);