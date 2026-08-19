import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";

export const aiWorker = new Worker(
    "ai-queue",
    async (job) => {
        logger.info({ file: job.data.file }, "Running AI tagging");

        await new Promise(resolve => setTimeout(resolve, 4000));

        logger.info("AI tagging completed");
    },
    {
        connection: redis,
        concurrency: 1,
    }
);