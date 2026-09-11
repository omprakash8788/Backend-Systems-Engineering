import { Request, Response } from "express";
import { FlowService } from "../services/flow.service.js";

export async function uploadImageFlow(
    req: Request,
    res: Response
) {
    // const { file } = req.body;

    const {
        file,
        enableAI = false,
        enableCaption = false,
        enableObjects = false,
        enableEmbeddings = false,
    } = req.body;

    if (typeof file !== "string" ||
        file.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "file is required",
        });
    }

    const options = [
    enableAI,
    enableCaption,
    enableObjects,
    enableEmbeddings,
];

 if (options.some(value => typeof value !== "boolean")) {

    return res.status(400).json({

        success: false,

        message:
            "AI options must be boolean values",

    });

}

    const flow = await FlowService.process(file, {
        enableAI,
        enableCaption,
        enableObjects,
        enableEmbeddings,
    });

    return res.status(200).json({
        success: true,
        message: "Dynamic flow created",
        jobId: flow.job.id,
    });
}