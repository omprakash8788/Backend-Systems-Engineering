import { emailQueue } from "../queues/email.queue.js";

export class BulkService {

    static async queueEmails(
        emails: string[]
    ) {

        const uniqueEmails = [...new Set(emails)];

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