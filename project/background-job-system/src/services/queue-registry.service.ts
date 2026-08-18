import { emailQueue } from "../queues/email.queue.js";
import { premiumEmailQueue } from "../queues/premium-email.queue.js";
import { pdfQueue } from "../queues/pdf.queue.js";
import { notificationQueue } from "../queues/notification.queue.js";
import { pipelineQueue } from "../queues/pipeline.queue.js";


export const QueueRegistry = {

    email: emailQueue,

    premiumEmail: premiumEmailQueue,

    pdf: pdfQueue,

    notification: notificationQueue,

    pipeline: pipelineQueue,

};