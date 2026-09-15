import { Request, Response } from "express";
import { BulkService } from "../services/bulk.service.js";
import { AppError } from "../errors/AppError.js";

export async function bulkEmail(
    req: Request,
    res: Response
) {

    const { emails } = req.body;


    if (emails.length > 1000) {

        throw new AppError(
            400,
            "Maximum batch size is 1000 emails",

        );

    }

    if (!Array.isArray(emails)) {
        throw new AppError(
            400,
            "emails must be an array"
        );
    }

    if (emails.length === 0) {
        throw new AppError(
            400,
            "emails must not be empty",

        );
    }

    if (
        emails.some(
            (email) =>
                typeof email !== "string" ||
                email.trim() === ""
        )
    ) {
        return res.status(400).json({
            success: false,
            message: "Every email must be a non-empty string"
        });
    }

    const jobs = await BulkService.queueEmails(
        emails
    );

    return res.status(202).json({

        success: true,
        message: "Bulk jobs enqueued",

        total: jobs.length,

        jobIds: jobs.map(job => job.id),

    });

}