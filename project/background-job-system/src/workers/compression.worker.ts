import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";

export const compressionWorker = new Worker(
    "compression-queue",
    async (job) => {
        logger.info({ file: job.data.file }, "Compressing image");

        await new Promise(resolve => setTimeout(resolve, 3000));

        logger.info("Compression completed");
    },
    {
        connection: redis,
        concurrency: 2,
    }
);