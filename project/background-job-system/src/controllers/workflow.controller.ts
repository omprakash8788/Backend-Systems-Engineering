import { Request, Response } from "express";
import { WorkflowService } from "../services/workflow.service.js";

export async function createWorkflow(
    req: Request,
    res: Response
) {

    const {
        reportId,
        email,
        userId,
    } = req.body;

    const flow = await WorkflowService.createReportWorkflow(
        reportId,
        email,
        userId
    );

    return res.status(202).json({
        success: true,
        flowId: flow.job.id,
    });

}