// Clientes Service — Lógica de negócio
import prisma from '../../config/database';

export interface CreateClienteDto {
  nome: string;
  cnpj: string;
  endereco?: string;
  cidade?: string;
  responsavel?: string;
  emailFinanceiro?: string;
  metadataCrm?: Record<string, unknown>;
}

export interface UpdateClienteDto {
  nome?: string;
  endereco?: string;
  cidade?: string;
  responsavel?: string;
  emailFinanceiro?: string;
  metadataCrm?: Record<string, unknown>;
}

export async function listarClientes(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      skip,
      take: limit,
      orderBy: { criadoEm: 'desc' },
      include: {
        _count: {
          select: { relatorios: true },
        },
      },
    }),
    prisma.cliente.count(),
  ]);

  return {
    data: clientes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function buscarCliente(id: string) {
  return prisma.cliente.findUnique({
    where: { id },
    include: {
      relatorios: {
        orderBy: { criadoEm: 'desc' },
        take: 10,
        select: {
          id: true,
          codigoRelatorio: true,
          titulo: true,
          status: true,
          periodoReferencia: true,
          criadoEm: true,
        },
      },
      _count: {
        select: { relatorios: true },
      },
    },
  });
}

export async function criarCliente(data: CreateClienteDto) {
  return prisma.cliente.create({
    data: {
      nome: data.nome,
      cnpj: data.cnpj,
      endereco: data.endereco,
      cidade: data.cidade,
      responsavel: data.responsavel,
      emailFinanceiro: data.emailFinanceiro,
      metadataCrm: (data.metadataCrm as any) || undefined,
    },
  });
}

export async function atualizarCliente(id: string, data: UpdateClienteDto) {
  return prisma.cliente.update({
    where: { id },
    data: {
      ...data,
      metadataCrm: (data.metadataCrm as any) || undefined,
    },
  });
}

export async function deletarCliente(id: string) {
  return prisma.cliente.delete({
    where: { id },
  });
}
