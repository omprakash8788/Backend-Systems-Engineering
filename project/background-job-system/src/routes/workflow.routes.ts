import { Router } from "express";
import { createWorkflow } from "../controllers/workflow.controller.js";

const router = Router();

router.post(
    "/workflow/report",
    createWorkflow
);

export default router;