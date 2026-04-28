// Clientes Controller — Handlers HTTP
import { Request, Response, NextFunction } from 'express';
import * as clientesService from './clientes.service';
import { createError } from '../../middleware/error-handler';

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await clientesService.listarClientes(page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function buscar(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const cliente = await clientesService.buscarCliente(id as string);

    if (!cliente) {
      throw createError('Cliente não encontrado', 404, 'CLIENTE_NOT_FOUND');
    }

    res.json({ success: true, data: cliente });
  } catch (error) {
    next(error);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome, cnpj, endereco, cidade, responsavel, emailFinanceiro, metadataCrm } = req.body;

    if (!nome || !cnpj) {
      throw createError('Nome e CNPJ são obrigatórios', 400, 'VALIDATION_ERROR');
    }

    const cliente = await clientesService.criarCliente({
      nome,
      cnpj,
      endereco,
      cidade,
      responsavel,
      emailFinanceiro,
      metadataCrm,
    });

    res.status(201).json({ success: true, data: cliente });
  } catch (error) {
    next(error);
  }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const cliente = await clientesService.atualizarCliente(id as string, req.body);
    res.json({ success: true, data: cliente });
  } catch (error) {
    next(error);
  }
}

export async function deletar(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await clientesService.deletarCliente(id as string);
    res.json({ success: true, message: 'Cliente deletado com sucesso' });
  } catch (error) {
    next(error);
  }
}
