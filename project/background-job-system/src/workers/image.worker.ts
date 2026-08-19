import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";

export const imageWorker = new Worker(

    "image-queue",

    async (job) => {

        logger.info(
            {
                jobId: job.id,
                image: job.data.image,
            },
            "Processing image"
        );

        await new Promise(resolve =>
            setTimeout(resolve, 3000)
        );

        logger.info(
            { jobId: job.id },
            "Image processed"
        );

    },

    {
        connection: redis,
        concurrency: 2,
    }

);