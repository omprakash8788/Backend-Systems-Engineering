import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const metadataQueue = new Queue(
    "metadata-queue",
    {
        connection: redis,
    }
);

