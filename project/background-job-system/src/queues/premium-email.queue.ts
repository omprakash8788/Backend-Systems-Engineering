import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const premiumEmailQueue = new Queue(
    "premium-email-queue",
    {
        connection: redis,
        defaultJobOptions: {
            attempts: 5,
            removeOnComplete: 100,
            removeOnFail: 100,
        },
    }
);