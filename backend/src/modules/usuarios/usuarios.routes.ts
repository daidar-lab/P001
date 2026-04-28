import { Router } from "express";
import * as usuariosController from "./usuarios.controller";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Todas as rotas de usuários exigem ser ADMIN
router.use(authMiddleware);
router.use(roleMiddleware(["ADMIN"]));

router.get("/", usuariosController.handleListar);
router.post("/", usuariosController.handleCriar);
router.delete("/:id", usuariosController.handleDeletar);

export default router;
