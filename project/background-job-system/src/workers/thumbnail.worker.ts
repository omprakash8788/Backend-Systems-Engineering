import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";
import { AggregationService } from "../services/aggregation.service.js";
import { aggregationQueue } from "../queues/aggregation.queue.js";

export const thumbnailWorker = new Worker(
    "thumbnail-queue",
    async (job) => {
        logger.info({ file: job.data.file }, "Generating thumbnail");

        await new Promise(resolve => setTimeout(resolve, 2000));

        logger.info("Thumbnail completed");

        const done =
            AggregationService.complete(
                job.data.pipelineId,
                
            );
            console.log("line 21", done)

           
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
    },
    {
        connection: redis,
        concurrency: 2,
    }
);