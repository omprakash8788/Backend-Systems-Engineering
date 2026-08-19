import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";

export const reportWorker = new Worker(

    "report-queue",

    async (job) => {

        logger.info(
            {
                jobId: job.id,
                report: job.data.report,
            },
            "Generating report"
        );

        await new Promise(resolve =>
            setTimeout(resolve, 5000)
        );

        logger.info(
            { jobId: job.id },
            "Report generated"
        );

    },

    {
        connection: redis,
        concurrency: 1,
    }

);