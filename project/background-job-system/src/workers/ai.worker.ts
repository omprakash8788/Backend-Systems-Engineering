import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";
import { AggregationService } from "../services/aggregation.service.js";
import { aggregationQueue } from "../queues/aggregation.queue.js";

export const aiWorker = new Worker(
    "ai-queue",
    async (job) => {
        logger.info({ file: job.data.file }, "Running AI tagging");

        await new Promise(resolve => setTimeout(resolve, 4000));

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

        logger.info("AI tagging completed");
    },
    {
        connection: redis,
        concurrency: 1,
    }
);