import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";

export const workflowWorker = new Worker(
    "workflow-queue",

    async (job) => {

        logger.info(
            {
                reportId: job.data.reportId,
            },
            "Workflow completed successfully."
        );

    },

    {
        connection: redis,
    }
);