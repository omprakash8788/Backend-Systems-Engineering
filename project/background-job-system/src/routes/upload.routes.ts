import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { uploadImageFlow } from "../controllers/image.controller.js";


const router = Router();

router.post(
    "/upload-image",
    uploadImage
);

router.post(
    "/upload-image-flow",
    uploadImageFlow
);

export default router;