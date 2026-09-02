import { Router } from "express";
import controllerFornecedores from "../controllers/controller.fornecedores.js";
import { verifyGerenteOuAdmin } from "../middlewares/gerente.middleware.js";

const routeFornecedores = Router();

routeFornecedores.get("/fornecedores", controllerFornecedores.ListarFornecedores);
routeFornecedores.get("/fornecedores/:id", controllerFornecedores.ObterFornecedor);
routeFornecedores.post("/fornecedores", verifyGerenteOuAdmin, controllerFornecedores.CriarFornecedor);
routeFornecedores.put("/fornecedores/:id", verifyGerenteOuAdmin, controllerFornecedores.AtualizarFornecedor);
routeFornecedores.patch("/fornecedores/:id/status", verifyGerenteOuAdmin, controllerFornecedores.AlternarStatusFornecedor);

export default routeFornecedores;