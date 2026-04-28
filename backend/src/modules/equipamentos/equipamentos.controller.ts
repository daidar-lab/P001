import { Request, Response, NextFunction } from 'express';
import * as equipamentosService from './equipamentos.service';

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const { clienteId } = req.query;
    if (!clienteId) return res.status(400).json({ success: false, message: 'clienteId é obrigatório' });
    
    const data = await equipamentosService.listarPorCliente(clienteId as string);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await equipamentosService.criarEquipamento(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = await equipamentosService.atualizarEquipamento(id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function excluir(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await equipamentosService.excluirEquipamento(id);
    res.json({ success: true, message: 'Equipamento excluído com sucesso' });
  } catch (error) {
    next(error);
  }
}
