import { emailQueue } from "../queues/email.queue.js";
import { pdfQueue } from "../queues/pdf.queue.js";
import { notificationQueue } from "../queues/notification.queue.js";


import { QueueRegistry } from "./queue-registry.service.js";


interface SendEmailOptions {
    email: string;
    isPremium: boolean;
    delay: number;
    priority: number;
}


export class QueueRouter {

     static async sendEmail(options: SendEmailOptions) {
        const queue = options.isPremium
            ? QueueRegistry.premiumEmail
            : QueueRegistry.email;

        return queue.add(
            "send-email",
            {
                email: options.email,
            },
            {
                jobId: options.email,
                delay: options.delay,
                priority: options.priority,
            }
        );
    }

    static async generatePdf(reportId: string) {

        return pdfQueue.add(
            "generate-pdf",
            {
                reportId,
            }
        );

    }

    static async sendNotification(
        userId: string,
        type: string
    ) {

        return notificationQueue.add(
            "notify",
            {
                userId,
                type,
            }
        );

    }

}