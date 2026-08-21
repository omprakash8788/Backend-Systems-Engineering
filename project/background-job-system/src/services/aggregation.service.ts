type PipelineStatus = {

    total: number;

    completed: number;

};

const pipelines =
    new Map<string, PipelineStatus>();

export class AggregationService {

    static initialize(
        pipelineId: string,
        total: number
    ) {

        pipelines.set(
            pipelineId,
            {

                total,

                completed: 0,

            }
        );

    }

    static complete(
        pipelineId: string
    ) {

        const pipeline =
            pipelines.get(
                pipelineId
            );

        if (!pipeline) {

            return false;

        }

        pipeline.completed++;

        return (
            pipeline.completed ===
            pipeline.total
        );

    }

}