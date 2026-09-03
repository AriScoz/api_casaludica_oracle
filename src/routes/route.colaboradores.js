import { Router } from "express";
import multer from "multer";
import controllerColaboradores from "../controllers/controller.colaboradores.js";
import { verifyGerenteOuAdmin } from "../middlewares/gerente.middleware.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const routeColaboradores = Router();

routeColaboradores.get("/colaboradores", controllerColaboradores.ListarColaboradores);
routeColaboradores.get("/colaboradores/aniversarios", controllerColaboradores.ListarAniversariantes);
routeColaboradores.get("/colaboradores/:id", controllerColaboradores.ObterColaborador);
routeColaboradores.post("/colaboradores", verifyGerenteOuAdmin, controllerColaboradores.CriarColaborador);
routeColaboradores.put("/colaboradores/:id", verifyGerenteOuAdmin, controllerColaboradores.AtualizarColaborador);
routeColaboradores.patch("/colaboradores/:id/status", verifyGerenteOuAdmin, controllerColaboradores.AlternarStatusColaborador);
routeColaboradores.post("/colaboradores/:id/foto", verifyGerenteOuAdmin, upload.single('foto'), controllerColaboradores.UploadFoto);

export default routeColaboradores;