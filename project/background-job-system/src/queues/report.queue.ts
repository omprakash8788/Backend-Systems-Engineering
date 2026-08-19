import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const reportQueue = new Queue(
    "report-queue",
    {
        connection: redis,
    }
);