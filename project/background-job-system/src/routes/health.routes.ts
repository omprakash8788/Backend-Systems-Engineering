import { Router } from "express";
import { getHealth } from "../controllers/health.controller.js";
import { AppError } from "../errors/AppError.js";


const router = Router();

router.get("/", getHealth)

router.get("/error", () => {
    throw new AppError(
        400,
        "Something went wrong"
    );
});


export default router;
