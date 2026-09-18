import { randomUUID } from "crypto";
import { redis } from "../config/redis.js";

export class DistributedLockService {

    static async acquire(
        resource: string,
        ttlMs: number
    ): Promise<string | null> {

        const token = randomUUID();

        const result = await redis.set(
            `lock:${resource}`,
            token,
            "PX",
            ttlMs,
            "NX"
        );

        if (result !== "OK") {
            return null;
        }

        return token;
    }

    static async release(
        resource: string,
        token: string
    ): Promise<boolean> {

        const key = `lock:${resource}`;

        const result = await redis.eval(
            `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
            `,
            1,
            key,
            token
        );

        return result === 1;
    }
}