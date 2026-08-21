import { aiQueue } from "../queues/ai.queue.js";
import { compressionQueue } from "../queues/compression.queue.js";
import { metadataQueue } from "../queues/metadata.queue.js";
import { thumbnailQueue } from "../queues/thumbnail.queue.js";
import crypto from "node:crypto";
import { AggregationService } from "./aggregation.service.js";



export class ImageFanoutService {

    static async process(file: string) {

        const pipelineId = crypto.randomUUID();

        const payload = { file, pipelineId };

        AggregationService.initialize(
            pipelineId,
            4
        );

        await Promise.all([
            thumbnailQueue.add("thumbnail", payload),
            compressionQueue.add("compression", payload),
            metadataQueue.add("metadata", payload),
            aiQueue.add("ai-tagging", payload),
        ]);

    }

}