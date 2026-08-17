import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const notificationQueue = new Queue(
    "notification-queue",
    {
        connection: redis,
        defaultJobOptions: {
            attempts: 5,
            removeOnComplete: 100,
            removeOnFail: 100,
        },
    }
);