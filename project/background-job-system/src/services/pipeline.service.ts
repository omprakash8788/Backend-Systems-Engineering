import { pipelineQueue } from "../queues/pipeline.queue.js";

export class PipelineService {

    static async startImport(fileName: string) {

        return pipelineQueue.add(
            "validate",

            {
                fileName,
            }
        );

    }
}

