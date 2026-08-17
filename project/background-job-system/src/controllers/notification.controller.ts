import { Request, Response } from "express";
import { QueueRouter } from "../services/queue-router.service.js";

export async function sendNotification(
    req: Request,
    res: Response
) {
    const { userId, type } = req.body;

    const job = await QueueRouter.sendNotification(
        userId,
        type
    );

    return res.status(202).json({
        success: true,
        message: "Notification queued successfully",
        jobId: job.id,
    });
}