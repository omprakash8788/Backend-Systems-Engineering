import { Request, Response } from "express"

import { emailQueue } from "../queues/email.queue.js"
import { logger } from "../logger/index.js";

type EmailPriority = "high" | "normal" | "low";

const PRIORITY_MAP: Record<EmailPriority, number> = {
    high: 1,
    normal: 5,
    low: 10,
};

export async function sendEmail(req: Request, res: Response) {

    const { email, delay = 0,   priority = "normal",} = req.body;

    if (typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Valid email is required"
        })
    }


    if (
        typeof delay !== "number" ||
        !Number.isInteger(delay) ||
        delay < 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Delay must be a positive integer",
        });
    }

     if (
        priority !== "high" &&
        priority !== "normal" &&
        priority !== "low"
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Priority must be high, normal, or low",
        });
    }

    const job = await emailQueue.add("send-email", {
        email
    },
        {
            jobId:email,
            delay,
            priority:PRIORITY_MAP[priority as EmailPriority],
        }

    
    );

    //  logger.info({ email }, "Adding job");


    return res.status(200).json({
        success: true,
        message: "Job Added Successfully",
        jobId: job.id,
        priority,
        delay

    })

}


