import { Request, Response } from "express";
import { QueueRouter } from "../services/queue-router.service.js";

export async function generatePdf(
    req: Request,
    res: Response
) {

    const { reportId } = req.body;

    const job = await QueueRouter.generatePdf(reportId);

    return res.status(202).json({
        success: true,
        jobId: job.id,
    });

}