import { Router } from "express";
import { getQueues } from "../controllers/queue.controller.js";

const router = Router();

router.get(
    "/admin/queues",
    getQueues
);

export default router;