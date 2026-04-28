import { Request, Response } from "express";
import * as usuariosService from "./usuarios.service";

export async function handleListar(req: Request, res: Response) {
  try {
    const users = await usuariosService.listarTodos();
    return res.json({ success: true, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function handleCriar(req: Request, res: Response) {
  try {
    const { username, password, nome, cargo } = req.body;

    if (!username || !password || !nome || !cargo) {
      return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios" });
    }

    const user = await usuariosService.criarUsuario({
      username,
      passwordHash: password, // O service faz o hash
      nome,
      cargo,
    });

    return res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: "Este nome de usuário já existe" });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function handleDeletar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Evitar que o admin se delete (opcional, mas recomendado)
    const currentUser = (req as any).user;
    if (currentUser.id === id) {
      return res.status(400).json({ success: false, message: "Você não pode excluir seu próprio usuário" });
    }

    await usuariosService.deletarUsuario(id);
    return res.json({ success: true, message: "Usuário excluído com sucesso" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
