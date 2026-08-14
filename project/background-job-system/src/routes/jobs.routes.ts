import { Router } from "express";

import { getJob, listJobs, retryJob, deleteJob, getJobProgress } from "../controllers/jobs.controller.js";


const router = Router();

router.get("/", listJobs)

router.get("/:id", getJob)

router.get("/:id/progress", getJobProgress);

router.post("/:id/retry", retryJob);

router.delete("/:id", deleteJob);



export default router;

