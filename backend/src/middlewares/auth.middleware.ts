import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "audit-energy-secret-key-2026";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    cargo: "ADMIN" | "USER";
    nome: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Token não fornecido" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token inválido ou expirado" });
  }
}

export function roleMiddleware(roles: ("ADMIN" | "USER")[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    if (!roles.includes(req.user.cargo)) {
      return res.status(403).json({ 
        success: false, 
        message: "Acesso negado: permissão insuficiente" 
      });
    }

    return next();
  };
}
