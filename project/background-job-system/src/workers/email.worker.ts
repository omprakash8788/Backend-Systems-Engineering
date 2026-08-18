import { Worker, Job } from "bullmq";
import { redis } from "../config/redis.js"
import { logger } from "../logger/index.js";
import { deadLetterQueue } from "../queues/dead-letter.queue.js";
import { processedEmails } from "../utils/processed-jobs.js";
interface EmailJobData {
    email: string;
}

export const emailWorker = new Worker<EmailJobData>(
    "email-queue",
    async (job: Job<EmailJobData>) => {
        logger.info({
            jobId: job.id,
            email: job.data.email,
            attempt: job.attemptsMade + 1

        }, "Processing email job");

        if (processedEmails.has(job.data.email)) {

            logger.warn(
                {
                    email: job.data.email,
                },
                "Duplicate job skipped"
            );

            return;
        }

        // Intentionally fail this job
        if (job.data.email === "fail@gmail.com") {
            throw new Error("Simulated email provider failure");
        }

        // Simulate email processing
        // await new Promise((resolve) => {
        //     setTimeout(resolve, 2000);
        // })
        logger.info({
            jobId: job.id,

        }, "Processing email job");


        if (job.name === "daily-report") {

            logger.info(
                "Generating scheduled report..."
            );

            await new Promise(resolve =>
                setTimeout(resolve, 2000)
            );

            logger.info(
                "Report generated."
            );

            return;
        }


        if (job.name === "cleanup") {

            logger.info(
                "Cleaning temporary files..."
            );

            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );

            logger.info(
                "Cleanup completed."
            );

            return;
        }


        //Step 1

        // await job.updateProgress(10);

        await job.updateProgress({
            percentage: 10,
            step: "Validating request",
        });

        await new Promise((resolve) => {
            setTimeout(resolve, 1000)
        });

        // STEP 2
        // await job.updateProgress(30);

        await job.updateProgress({
            percentage: 30,
            step: "Loading template",
        });

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });

        // STEP 3
        // await job.updateProgress(60);

        await job.updateProgress({
            percentage: 60,
            step: "Generating HTML",
        });


        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });

        // STEP 4
        // await job.updateProgress(80);

        await job.updateProgress({
            percentage: 80,
            step: "Sending email",
        });

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });

        // Finished
        // await job.updateProgress(100);

        await job.updateProgress({
            percentage: 100,
            step: "Completed",
        });

        logger.info(
            {
                jobId: job.id,
                email: job.data.email,
                processedAt: new Date().toISOString(),
            },
            "Email processed successfully"
        );
        processedEmails.add(job.data.email);
    },
    {
        connection: redis,
        concurrency: 5,
        limiter: {
            max: 10,
            duration: 10000
        }
    }

);

emailWorker.on("completed", (job) => {
    logger.info({
        jobId: job.id,
    }, "Job completed")
});

emailWorker.on("failed", async (job, error) => {
    logger.error({
        jobId: job?.id,
        attemptsMade: job?.attemptsMade,
        error: error.message,
    }, "Job failed")

    if (!job) {
        return;
    }

    if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
        await deadLetterQueue.add(
            "failed-email-job",
            {
                originalJobId: job.id,
                email: job.data.email,
                reason: error.message,
                failedAt: new Date().toISOString(),
            }
        );
        logger.warn({
            originalJobId: job.id,
        }, "Moved job to Dead Letter Queue");
    }
});


logger.info("Email worker started")




