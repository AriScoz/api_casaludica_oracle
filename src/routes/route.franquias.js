import { Router } from "express";
import controllerFranquias from "../controllers/controller.franquias.js";
import { verifyGerenteOuAdmin } from "../middlewares/gerente.middleware.js";

const routeFranquias = Router();

routeFranquias.get("/franquias", controllerFranquias.ListarFranquias);
routeFranquias.get("/franquias/tipos", controllerFranquias.ListarTipos);
routeFranquias.get("/franquias/:id", controllerFranquias.ObterFranquia);
routeFranquias.post("/franquias", verifyGerenteOuAdmin, controllerFranquias.CriarFranquia);
routeFranquias.put("/franquias/:id", verifyGerenteOuAdmin, controllerFranquias.AtualizarFranquia);
routeFranquias.patch("/franquias/:id/status", verifyGerenteOuAdmin, controllerFranquias.AlternarStatusFranquia);

export default routeFranquias;