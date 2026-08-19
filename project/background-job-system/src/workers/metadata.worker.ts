import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";

export const metadataWorker = new Worker(
    "metadata-queue",
    async (job) => {
        logger.info({ file: job.data.file }, "Extracting metadata");

        await new Promise(resolve => setTimeout(resolve, 1500));

        logger.info("Metadata extracted");
    },
    {
        connection: redis,
        concurrency: 2,
    }
);