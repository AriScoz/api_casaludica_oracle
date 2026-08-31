import { Router } from "express";
import multer from "multer";
import controllerDocumentos from "../controllers/controller.documentos.js";
import { verifyGerenteOuAdmin } from "../middlewares/gerente.middleware.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const routeDocumentos = Router();

routeDocumentos.get("/documentos", controllerDocumentos.ListarDocumentos);
routeDocumentos.get("/documentos/:id/download", controllerDocumentos.BaixarDocumento);
routeDocumentos.post("/documentos", verifyGerenteOuAdmin, upload.single('arquivo'), controllerDocumentos.UploadDocumento);
routeDocumentos.delete("/documentos/:id", verifyGerenteOuAdmin, controllerDocumentos.ExcluirDocumento);

export default routeDocumentos;