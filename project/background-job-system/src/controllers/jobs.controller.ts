import { Request, Response } from "express";
import { emailQueue} from "../queues/email.queue.js";

export async function getJob(req:Request, res:Response){
    const {id} = req.params;

    const job = await emailQueue.getJob(id as string);

    if(!job){
        return res.status(404).json({
            success:false,
            message:"Job not found"
        })
    }

    return res.json({
        success:true,
        data:{
            id: job.id,
            name: job.name,
            data: job.data,
            attemptsMade: job.attemptsMade,
            delay: job.opts.delay ?? 0,
            priority: job.opts.priority ?? null,
            timestamp: job.timestamp,
            progress:job.progress,
        }
    })

}


export async function listJobs(req:Request, res:Response){
    const status = (req.query.status as string) ?? "waiting";

    const jobs = await emailQueue.getJobs([status as any]);

    return res.json({
        success:true,
        count:jobs.length,
        data:jobs.map((job)=>({
              id: job.id,
            name: job.name,
            email: job.data.email,
            attemptsMade: job.attemptsMade,
        }))
    })

}


export async function retryJob(
    req: Request,
    res: Response
) {
    const job = await emailQueue.getJob(req.params.id as string);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    await job.retry();

    return res.json({
        success: true,
        message: "Retry requested",
    });
}


export async function deleteJob(
    req: Request,
    res: Response
) {
    const job = await emailQueue.getJob(req.params.id as string);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    await job.remove();

    return res.json({
        success: true,
        message: "Job removed",
    });
}


export async function getJobProgress(
    req: Request,
    res: Response
) {
    const job = await emailQueue.getJob(req.params.id as string);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    return res.json({
        success: true,
        progress: job.progress,
    });
}