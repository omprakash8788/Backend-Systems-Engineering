import { Worker, Job } from "bullmq";
import {redis} from "../config/redis.js"
import { logger } from "../logger/index.js";
import { deadLetterQueue } from "../queues/dead-letter.queue.js";

interface EmailJobData{
    email:string;
}

const emailWorker = new Worker<EmailJobData>(
    "email-queue",
    async (job:Job<EmailJobData>)=>{
        logger.info({
            jobId:job.id,
            email:job.data.email,
            attempt:job.attemptsMade + 1

        }, "Processing email job");

         // Intentionally fail this job
        if (job.data.email === "fail@gmail.com") {
            throw new Error("Simulated email provider failure");
        }

        // Simulate email processing
        await new Promise((resolve)=>{
            setTimeout(resolve, 2000);
        })
        logger.info({
            jobId:job.id,

        }, "Email process successfully")
    },
    {
        connection:redis,
    }

);

emailWorker.on("completed", (job)=>{
    logger.info({
        jobId:job.id,
    }, "Job completed")
});

emailWorker.on("failed", async (job, error)=>{
    logger.error({
        jobId:job?.id,
         attemptsMade: job?.attemptsMade,
        error:error.message,
    }, "Job failed")

    if(!job){
        return;
    }

    if(job.attemptsMade >= (job.opts.attempts ?? 1)){
        await deadLetterQueue.add(
            "failed-email-job",
            {
              originalJobId: job.id,
                email: job.data.email,
                reason: error.message,
                failedAt: new Date().toISOString(),
            }
        );
         logger.warn({
            originalJobId: job.id,
        }, "Moved job to Dead Letter Queue");
    }
});


logger.info("Email worker started")




