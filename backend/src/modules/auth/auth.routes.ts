import { Router } from "express";
import * as authController from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Pública
router.post("/login", authController.handleLogin);

// Protegida (para validar token)
router.get("/me", authMiddleware, authController.validateToken);

export default router;
