import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";

export const thumbnailWorker = new Worker(
    "thumbnail-queue",
    async (job) => {
        logger.info({ file: job.data.file }, "Generating thumbnail");

        await new Promise(resolve => setTimeout(resolve, 2000));

        logger.info("Thumbnail completed");
    },
    {
        connection: redis,
        concurrency: 2,
    }
);