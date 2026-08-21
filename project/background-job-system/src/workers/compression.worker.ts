import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";
import { AggregationService } from "../services/aggregation.service.js";
import { aggregationQueue } from "../queues/aggregation.queue.js";

export const compressionWorker = new Worker(
    "compression-queue",
    async (job) => {
        logger.info({ file: job.data.file }, "Compressing image");

        await new Promise(resolve => setTimeout(resolve, 3000));

        const done =
            AggregationService.complete(
                job.data.pipelineId
            );

        if (done) {

            await aggregationQueue.add(

                "publish-image",

                {

                    pipelineId:
                        job.data.pipelineId,

                    file:
                        job.data.file,

                }

            );

        }

        logger.info("Compression completed");
    },
    {
        connection: redis,
        concurrency: 2,
    }
);