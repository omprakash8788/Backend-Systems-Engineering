import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";

export const premiumEmailWorker = new Worker(
    "premium-email-queue",

    async (job) => {

        logger.info(
            {
                jobId: job.id,
                email: job.data.email,
                plan: "PREMIUM",
            },
            "Processing premium email"
        );

        await new Promise(resolve => setTimeout(resolve, 1000));

        logger.info(
            {
                jobId: job.id,
            },
            "Premium email sent"
        );

    },

    {
        connection: redis,

        concurrency: 10,
    }
);