import { emailQueue } from "../queues/email.queue.js";
import { logger } from "../logger/index.js";

export async function registerEmailScheduler() {

    await emailQueue.upsertJobScheduler(
        "daily-report",
        {
            pattern: "*/30 * * * * *"
        },
        {
            name: "daily-report",

            data: {
                report: true,
            },

            opts: {
                removeOnComplete: 100,
                removeOnFail: 100,
            },
        }
    )

    await emailQueue.upsertJobScheduler(
        "cleanup",

        {
            pattern: "*/45 * * * * *",
        },

        {
            name: "cleanup",

            data: {},

            opts: {
                removeOnComplete: 100,
            },
        }
    );
    logger.info("Daily report scheduler registered");
}