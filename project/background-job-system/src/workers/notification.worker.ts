import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";

export const notificationWorker = new Worker(
    "notification-queue",

    async (job) => {

        logger.info(
            {
                userId: job.data.userId,
                type: job.data.type,
            },
            "Sending notification"
        );

        await new Promise(resolve =>
            setTimeout(resolve, 1000)
        );

        logger.info("Notification sent");

    },

    {
        connection: redis,
        concurrency: 10,
    }
);