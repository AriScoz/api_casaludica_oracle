import { Router } from "express";
import controllerUsuarios from "../controllers/controller.usuarios.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const routeUsuarios = Router();

routeUsuarios.post("/usuarios", verifyAdmin, controllerUsuarios.CriarUsuario);
routeUsuarios.get("/usuarios", verifyAdmin, controllerUsuarios.ListarUsuarios);
routeUsuarios.patch("/usuarios/:id/ativo", verifyAdmin, controllerUsuarios.AlternarAtivoUsuario);

export default routeUsuarios;