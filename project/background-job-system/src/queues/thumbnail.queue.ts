import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const thumbnailQueue = new Queue(
    "thumbnail-queue",
    {
        connection: redis,
    }
);