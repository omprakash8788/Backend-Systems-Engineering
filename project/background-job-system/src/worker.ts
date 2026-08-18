import { emailWorker } from "./workers/email.worker.js"
import { dlqWorker } from "./workers/dlq.worker.js"
import { logger } from "./logger/index.js"
import "./events/email.events.js"
import { registerEmailScheduler } from "./schedulers/email.scheduler.js";
import "./workers/pdf.worker.js";
import "./workers/notification.worker.js";
import "./workers/workflow.worker.js";
import "./workers/premium-email.worker.js";
import "./workers/pipeline.worker.js";


async function start() {
    await registerEmailScheduler();
}

start().catch((err) => {
    logger.error(err, "Failed to start worker");
    process.exit(1);
});


logger.info("Worker started");

async function shutdown(signal: string) {
    logger.warn({ signal }, "Shutdown signal received");
    logger.info("Closing Email Worker...")
    await emailWorker.close();
    logger.info("Closing DLQ Worker...");
    await dlqWorker.close();
    logger.info("All workers closed");
    process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));

