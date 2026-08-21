import { emailQueue } from "../queues/email.queue.js";
import { premiumEmailQueue } from "../queues/premium-email.queue.js";
import { pdfQueue } from "../queues/pdf.queue.js";
import { notificationQueue } from "../queues/notification.queue.js";
import { pipelineQueue } from "../queues/pipeline.queue.js";
import { imageQueue } from "../queues/image.queue.js";
import { reportQueue } from "../queues/report.queue.js";
import { thumbnailQueue } from "../queues/thumbnail.queue.js";
import { compressionQueue } from "../queues/compression.queue.js";
import { metadataQueue } from "../queues/metadata.queue.js";
import { aiQueue } from "../queues/ai.queue.js";
import { aggregationQueue } from "../queues/aggregation.queue.js";


export const QueueRegistry = {

    email: emailQueue,

    premiumEmail: premiumEmailQueue,

    pdf: pdfQueue,

    notification: notificationQueue,

    pipeline: pipelineQueue,

    image: imageQueue,

    report: reportQueue,

    thumbnail: thumbnailQueue,

    compression: compressionQueue,

    metadata: metadataQueue,
    
    ai: aiQueue,

    aggregation: aggregationQueue,

};