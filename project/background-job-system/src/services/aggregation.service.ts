import { redis } from "../config/redis.js";

export class AggregationService {

    static async initialize(
        pipelineId: string,
        total: number
    ) {

        const key = `pipeline:${pipelineId}`;

        await redis.hset(key, "total", total.toString());
        await redis.hset(key, "completed", "0");

        console.log(await redis.hgetall(key));
    }

    static async complete(
        pipelineId: string
    ): Promise<boolean> {

        const key = `pipeline:${pipelineId}`;

        const completed = await redis.hincrby(
            key,
            "completed",
            1
        );

        const total = Number(
            await redis.hget(
                key,
                "total"
            )
        );

        console.log({
            key,
            completed,
            total,
        });

        return completed === total;
    }

    static async remove(
        pipelineId: string
    ) {

        await redis.del(
            `pipeline:${pipelineId}`
        );

    }

}