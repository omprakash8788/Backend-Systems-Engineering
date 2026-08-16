import { QueueEvents } from "bullmq";
import { redis } from "../config/redis.js"
import { logger } from "../logger/index.js";
import { queueEventHistory } from "../utils/event-history.js";


function recordEvent(
    jobId: string,
    type: string
) {
    queueEventHistory.push({
        jobId,
        type,
        timestamp: new Date().toISOString(),
    });

    if (queueEventHistory.length > 100) {
        queueEventHistory.shift();
    }
}

export const emailQueueEvents = new QueueEvents(
    "email-queue",
    {
        connection: redis
    }
)

emailQueueEvents.on("waiting", ({ jobId }) => {
    recordEvent(jobId!, "waiting");
    logger.info(
        { jobId },
        "Job waiting"
    );
});

emailQueueEvents.on("active", ({ jobId }) => {
    recordEvent(jobId!, "active");
    logger.info(
        { jobId },
        "Job started"
    );
});

emailQueueEvents.on("completed", ({ jobId }) => {
    recordEvent(jobId!, "completed");

    logger.info(
        { jobId },
        "Job completed"
    );
});

emailQueueEvents.on("failed", ({ jobId, failedReason }) => {
    recordEvent(jobId!, "failed");
    logger.error(
        {
            jobId,
            failedReason,
        },
        "Job failed"
    );
});

emailQueueEvents.on(
    "progress",
    ({ jobId, data }) => {
        recordEvent(jobId!, "progress");
        logger.info(
            {
                jobId,
                progress: data,
            },
            "Progress updated"
        );
    }
);