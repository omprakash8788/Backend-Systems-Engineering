import { Worker, Job } from "bullmq";
import { redis } from "../config/redis.js"
import { logger } from "../logger/index.js";

interface DeadLetterJob {
    originalJobId: string;
    email: string;
    reason: string;
    failedAt: string;
}

export const dlqWorker = new Worker<DeadLetterJob>(
    "dead-letter-queue",

    async (job: Job<DeadLetterJob>) => {
        logger.warn({
            originalJobId: job.data.originalJobId,
            email: job.data.email,
            reason: job.data.reason,
            failedAt: job.data.failedAt,
        }, "Dead Letter Job Received")
    },
    {
        connection:redis,
    }
)
logger.info("DLQ Worker Started");

