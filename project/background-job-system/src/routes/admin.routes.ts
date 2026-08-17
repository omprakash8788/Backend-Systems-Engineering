import { Router } from "express";

import {
    pauseQueue,
    resumeQueue,
    queueStatus,
} from "../controllers/admin.controller.js";

const router = Router();

router.post(
    "/admin/queues/:queue/pause",
    pauseQueue
);

router.post(
    "/admin/queues/:queue/resume",
    resumeQueue
);

router.get(
    "/admin/queues/:queue/status",
    queueStatus
);

export default router;