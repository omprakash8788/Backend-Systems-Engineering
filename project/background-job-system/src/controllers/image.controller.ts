import { Request, Response } from "express";
import { FlowService } from "../services/flow.service.js";

export async function uploadImageFlow(
    req: Request,
    res: Response
) {
    const { file } = req.body;

    if (!file) {
        return res.status(400).json({
            success: false,
            message: "file is required",
        });
    }

    await FlowService.process(file);

    return res.status(200).json({
        success: true,
        message: "Flow started successfully",
    });
}