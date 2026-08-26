import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";
import { AggregationService }
    from "../services/aggregation.service.js";


export const aggregationWorker =
    new Worker(

        "aggregation-queue",

        async (job) => {

            logger.info(

                {
                    jobName: job.name,
                    pipelineId:
                        job.data.pipelineId,

                    file:
                        job.data.file,

                },

                "Publishing Image"

            );

            // Lecture 12 (Manual Redis Fan-In)
            if (job.data.pipelineId) {
                await AggregationService.remove(job.data.pipelineId);
            }


            await AggregationService.remove(
                job.data.pipelineId
            );

        },

        {

            connection: redis,

        }

    );