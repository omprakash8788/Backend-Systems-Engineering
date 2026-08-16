import { Router } from "express";

import { getQueueEvents } from "../controllers/events.controller.js";

const router = Router();

router.get("/", getQueueEvents);

export default router;

