import { Router } from "express";
import controllerListas from "../controllers/controller.listas.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const routeListas = Router();

routeListas.get("/listas/:recurso", controllerListas.Listar);
routeListas.post("/listas/:recurso", verifyAdmin, controllerListas.Criar);
routeListas.patch("/listas/:recurso/:id", verifyAdmin, controllerListas.AlternarAtivo);

export default routeListas;