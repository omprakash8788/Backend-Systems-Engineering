import { emailQueue } from "../queues/email.queue.js";

export class QueueHealthService {

    static async isHealthy() {

        const counts =
            await emailQueue.getJobCounts(
                "waiting",
                "active"
            );

        const pending =
            counts.waiting +
            counts.active;

        return {
            healthy: pending < 5000,
            pending,
        };

    }

}