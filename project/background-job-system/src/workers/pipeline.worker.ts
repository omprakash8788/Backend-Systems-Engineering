import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { pipelineQueue } from "../queues/pipeline.queue.js";
import { logger } from "../logger/index.js";

export const pipelineWorker = new Worker(
    "pipeline-queue",

    async (job) => {

        switch (job.name) {

            case "validate":

                logger.info("Validating CSV");

                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );

                await pipelineQueue.add(
                    "parse",
                    job.data
                );

                break;

            case "parse":

                logger.info("Parsing CSV");

                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );

                await pipelineQueue.add(
                    "save",
                    job.data
                );

                break;

            case "save":

                logger.info("Saving records");

                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );

                await pipelineQueue.add(
                    "notify",
                    job.data
                );

                break;

            case "notify":

                logger.info("Sending summary email");

                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );

                logger.info("Pipeline completed");

                break;

        }

    },

    {
        connection: redis,
        concurrency: 1,
    }
);