import { Router } from "express";
import controllerCalendario from "../controllers/controller.calendario.js";
import { verifyGerenteOuAdmin } from "../middlewares/gerente.middleware.js";

const routeCalendario = Router();

routeCalendario.get("/calendario", controllerCalendario.ListarCalendario);
routeCalendario.post("/calendario", verifyGerenteOuAdmin, controllerCalendario.CriarEvento);
routeCalendario.delete("/calendario/:id", verifyGerenteOuAdmin, controllerCalendario.ExcluirEvento);

export default routeCalendario;