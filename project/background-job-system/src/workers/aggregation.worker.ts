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

                    pipelineId:
                        job.data.pipelineId,

                    file:
                        job.data.file,

                },

                "Publishing Image"

            );

            await AggregationService.remove(
                job.data.pipelineId
            );

        },

        {

            connection: redis,

        }

    );