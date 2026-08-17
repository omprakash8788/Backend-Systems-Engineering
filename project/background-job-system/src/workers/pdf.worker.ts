import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../logger/index.js";

export const pdfWorker = new Worker(
    "pdf-queue",

    async (job) => {

        logger.info(
            {
                jobId: job.id,
                reportId: job.data.reportId,
            },
            "Generating PDF"
        );

        await new Promise(resolve =>
            setTimeout(resolve, 3000)
        );

        logger.info(
            {
                jobId: job.id,
            },
            "PDF generated"
        );

        // logger.error(
        //     {
        //         jobId: job.id,
        //         reportId: job.data.reportId,
        //     },
        //     "PDF generation failed"
        // );

        // throw new Error("PDF generation failed");


    },

    {
        connection: redis,
        concurrency: 2,
    }
);