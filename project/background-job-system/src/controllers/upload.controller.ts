import { Request, Response } from "express";
import { ImageFanoutService } from "../services/image-fanout.service.js";
import { AppError } from "../errors/AppError.js";

export async function uploadImage(
    req: Request,
    res: Response
) {

    const { file } = req.body;

    if (!file) {
        throw new AppError(
              400,
            "file is required",
          
        );
    }

    await ImageFanoutService.process(file);

    return res.status(202).json({
        success: true,
        message: "Image processing started"
    });

}