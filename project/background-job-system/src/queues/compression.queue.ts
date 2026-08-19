import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const compressionQueue = new Queue(
    "compression-queue",
    {
        connection: redis,
    }
);