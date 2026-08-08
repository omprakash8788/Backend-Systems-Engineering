import {Request, Response} from "express"

import { emailQueue } from "../queues/email.queue.js"

export async function sendEmail(req:Request, res:Response){

    const {email} = req.body;

     
    await emailQueue.add("send-email",{
         email
    });


    return res.status(200).json({
        success:true,
        message:"Job Added Successfully"
    })

}


