import { Router } from "express";
import {
    createImageJob,
    createReportJob,
} from "../controllers/demo.controller.js";

const router = Router();

router.post(
    "/demo/image",
    createImageJob
);

router.post(
    "/demo/report",
    createReportJob
);

export default router;