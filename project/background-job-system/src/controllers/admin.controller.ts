import { Request, Response } from "express";
import { QueueManager } from "../services/queue-manager.service.js";
import { QueueHealthService } from "../services/queue-health.service.js";


export async function pauseQueue(
    req: Request,
    res: Response
) {

    const { queue } = req.params;

    await QueueManager.pause(queue as string);

    return res.json({
        success: true,
        message: `${queue} queue paused`,
    });

}

export async function resumeQueue(
    req: Request,
    res: Response
) {

    const { queue } = req.params;

    await QueueManager.resume(queue as string);

    return res.json({
        success: true,
        message: `${queue} queue resumed`,
    });

}

export async function queueStatus(
    req: Request,
    res: Response
) {

    const { queue } = req.params;

    const status = await QueueManager.status(queue as string);

    return res.json({
        success: true,
        queue,
        status,
    });

}

export async function queueHealth(
    req: Request,
    res: Response
) {

    const health =
        await QueueHealthService.isHealthy();

    return res.json({
        success: true,
        ...health,
    });

}