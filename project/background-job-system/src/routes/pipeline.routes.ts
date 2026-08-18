import { Router } from "express";

import { importCsv } from "../controllers/pipeline.controller.js";

const router = Router();

router.post(
    "/pipeline/import",
    importCsv
);

export default router;