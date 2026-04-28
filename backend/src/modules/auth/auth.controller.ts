import { Request, Response } from "express";
import * as authService from "./auth.service";

export async function handleLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username e password são obrigatórios" 
      });
    }

    const result = await authService.login(username, password);

    return res.json({
      success: true,
      data: result
    });
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: err.message || "Erro na autenticação"
    });
  }
}

export async function validateToken(req: Request, res: Response) {
  // Rota simples para o frontend validar se o token ainda é válido
  return res.json({ success: true, user: (req as any).user });
}
