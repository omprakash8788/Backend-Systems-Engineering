import { Queue } from "bullmq";

import { redis } from "../config/redis.js";

export const pipelineQueue = new Queue(
    "pipeline-queue",
    {
        connection: redis,
    }
);
