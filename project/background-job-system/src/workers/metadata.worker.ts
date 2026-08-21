import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";
import { AggregationService } from "../services/aggregation.service.js";
import { aggregationQueue } from "../queues/aggregation.queue.js";

export const metadataWorker = new Worker(
    "metadata-queue",
    async (job) => {
        logger.info({ file: job.data.file }, "Extracting metadata");

        await new Promise(resolve => setTimeout(resolve, 1500));

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

        logger.info("Metadata extracted");
    },
    {
        connection: redis,
        concurrency: 2,
    }
);