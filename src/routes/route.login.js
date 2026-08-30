import { Router } from "express";
import controllerLogin from "../controllers/controller.login.js";

const routeLogin = Router();

routeLogin.post("/login", controllerLogin.Logar);

export default routeLogin;