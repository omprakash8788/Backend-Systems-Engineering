import {Request, Response} from "express"

import { emailQueue } from "../queues/email.queue.js"

export async function sendEmail(req:Request, res:Response){

    const {email, delay=0} = req.body;

  

     
   const job =  await emailQueue.add("send-email",{
         email
    },
    {
        delay,
    }

);


    return res.status(200).json({
        success:true,
        message:"Job Added Successfully",
        jobId:job.id,
        delay

    })

}


