import { Router } from "express";
import { generatePdf } from "../controllers/pdf.controller.js";

const router = Router();

router.post(
    "/generate-pdf",
    generatePdf
);

export default router;