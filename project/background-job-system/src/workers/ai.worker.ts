import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";
import { AggregationService } from "../services/aggregation.service.js";
import { aggregationQueue } from "../queues/aggregation.queue.js";

export const aiWorker = new Worker(
    "ai-queue",
    async (job) => {
        logger.info({ file: job.data.file }, "AI Worker");

             switch (job.name) {

            case "generate-caption":

                logger.info("Generating caption...");
                break;

            case "detect-objects":

                logger.info("Detecting objects...");
                break;

            case "generate-embeddings":

                logger.info("Generating embeddings...");
                break;

            case "ai-processing":

                logger.info("Final AI processing completed.");
                break;

            default:

                logger.warn(
                    {
                        jobName: job.name,
                    },
                    "Unknown AI Job"
                );

        }

        await new Promise(resolve => setTimeout(resolve, 1500));

        logger.info(
            {
                pipelineId: job.data.pipelineId,
            },
            "Worker received pipeline"
        );

        const done =
            await AggregationService.complete(
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
        concurrency: 2,
    }
);