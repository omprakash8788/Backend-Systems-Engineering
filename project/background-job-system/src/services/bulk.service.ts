import { emailQueue } from "../queues/email.queue.js";

export class BulkService {

    static async queueEmails(
        emails: string[]
    ) {

        const uniqueEmails = [...new Set(emails)];

        const counts = await emailQueue.getJobCounts(
            "waiting",
            "active"
        );

        const totalPending =
            counts.waiting + counts.active;

        if (totalPending > 5000) {

            throw new Error(
                "Queue is overloaded. Please try again later."
            );

        }

        return emailQueue.addBulk(

            uniqueEmails.map((email) => ({

                name: "send-email",

                data: {
                    email,
                },

            }))

        );

    }

}