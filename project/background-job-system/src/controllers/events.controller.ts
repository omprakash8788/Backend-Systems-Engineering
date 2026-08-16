import { Request, Response } from "express";

import { queueEventHistory } from "../utils/event-history.js";

export function getQueueEvents(
    req: Request,
    res: Response
) {
    return res.json({
        success: true,
        count: queueEventHistory.length,
        data: queueEventHistory,
    });
}
