import { QueueRegistry } from "./queue-registry.service.js";


const queues = {
    email: QueueRegistry.email,
    "premium-email": QueueRegistry.premiumEmail,
    pdf: QueueRegistry.pdf,
    notification: QueueRegistry.notification,
};



export class QueueManager {

    // static getQueue(name: string) {

    //     switch (name) {

    //         case "email":
    //             return QueueRegistry.email;

    //         case "premium-email":
    //             return QueueRegistry.premiumEmail;

    //         case "pdf":
    //             return QueueRegistry.pdf;

    //         case "notification":
    //             return QueueRegistry.notification;

    //         default:
    //             return null;

    //     }

    // }

     static getQueue(name: keyof typeof queues) {
        return queues[name] ?? null;
    }

    static async pause(queueName: string) {

        const queue = this.getQueue(queueName);

        if (!queue) {
            throw new Error(`Queue '${queueName}' not found`);
        }

        await queue.pause();

    }

    static async resume(queueName: string) {

        const queue = this.getQueue(queueName);

        if (!queue) {
            throw new Error(`Queue '${queueName}' not found`);
        }

        await queue.resume();

    }

    static async status(queueName: string) {

        const queue = this.getQueue(queueName);

        if (!queue) {
            throw new Error(`Queue '${queueName}' not found`);
        }

        const counts = await queue.getJobCounts(
            "waiting",
            "active",
            "completed",
            "failed",
            "delayed"
        );

        return counts;

    }

}