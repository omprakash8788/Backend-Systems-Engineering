import { emailQueue } from "../queues/email.queue.js";

export class JobService {

    static async getJob(jobId: string) {

        const job =
            await emailQueue.getJob(jobId);

        if (!job) {

            return null;

        }

        return {

            id: job.id,

            name: job.name,

            progress: job.progress,

            state: await job.getState(),

            attemptsMade:
                job.attemptsMade,

            delay: job.delay,

            timestamp:
                job.timestamp,

            data: job.data,

        };

    }

}