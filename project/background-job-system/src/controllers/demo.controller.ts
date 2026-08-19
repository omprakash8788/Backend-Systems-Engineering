import { Request, Response } from "express";
import { imageQueue } from "../queues/image.queue.js";
import { reportQueue } from "../queues/report.queue.js";

export async function createImageJob(
    req: Request,
    res: Response
) {

    const job = await imageQueue.add(
        "resize-image",
        {
            image: req.body.image,
        }
    );

    return res.status(202).json({
        success: true,
        jobId: job.id,
    });

}

export async function createReportJob(
    req: Request,
    res: Response
) {

    const job = await reportQueue.add(
        "generate-report",
        {
            report: req.body.report,
        }
    );

    return res.status(202).json({
        success: true,
        jobId: job.id,
    });

}