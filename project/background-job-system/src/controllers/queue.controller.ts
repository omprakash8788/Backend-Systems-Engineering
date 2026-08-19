import { Request, Response } from "express";
import { QueueManager } from "../services/queue-manager.service.js";

export async function getQueues(
    req: Request,
    res: Response
) {

    const queues =
        QueueManager.getAllQueues();

    return res.json({

        success: true,

        total: queues.length,

        queues,

    });

}