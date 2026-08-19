import { aiQueue } from "../queues/ai.queue.js";
import { compressionQueue } from "../queues/compression.queue.js";
import { metadataQueue } from "../queues/metadata.queue.js";
import { thumbnailQueue } from "../queues/thumbnail.queue.js";

export class ImageFanoutService {

    static async process(file: string) {

        const payload = { file };

        await Promise.all([
            thumbnailQueue.add("thumbnail", payload),
            compressionQueue.add("compression", payload),
            metadataQueue.add("metadata", payload),
            aiQueue.add("ai-tagging", payload),
        ]);

    }

}