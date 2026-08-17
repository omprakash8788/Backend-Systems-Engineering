import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const pdfQueue = new Queue(
    "pdf-queue",
    {
        connection: redis,
        defaultJobOptions: {
            attempts: 3,
            removeOnComplete: 100,
            removeOnFail: 100,
        },
    }
);