import { Router } from "express";
import { bulkEmail } from "../controllers/bulk.controller.js";

const router = Router();

router.post(
    "/bulk-email",
    bulkEmail
);

export default router;