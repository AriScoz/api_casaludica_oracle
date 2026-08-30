import { Router } from "express";
import multer from "multer";
import controllerBanner from "../controllers/controller.banner.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const routeBanner = Router();

routeBanner.get("/banner/:tela", controllerBanner.ObterBanner);
routeBanner.post("/banner/:tela", verifyAdmin, upload.single('imagem'), controllerBanner.UploadBanner);

export default routeBanner;