import { Request, Response } from "express";
import { PipelineService } from "../services/pipeline.service.js";
import { AppError } from "../errors/AppError.js";

export async function importCsv(
    req: Request,
    res: Response
) {

    const { fileName } = req.body;

    if (!fileName) {

        throw new AppError(
            400,
            "fileName is required",

        );

    }

    const job =
        await PipelineService.startImport(
            fileName
        );

    return res.status(202).json({

        success: true,

        jobId: job.id,

        message:
            "CSV import pipeline started",

    });

}