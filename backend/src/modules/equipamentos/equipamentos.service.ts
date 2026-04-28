import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

export async function listarPorCliente(clienteId: string) {
  return prisma.inventarioEquipamento.findMany({
    where: { clienteId },
    orderBy: { criadoEm: 'asc' },
  });
}

export async function criarEquipamento(data: {
  clienteId: string;
  descricao: string;
  quantidade: number;
  potenciaWatts: number;
  horasDia: number;
  diasMes: number;
}) {
  // Cálculo automático do consumo mensal
  const consumoMensalKwh = (data.potenciaWatts * data.horasDia * data.diasMes * data.quantidade) / 1000;

  return prisma.inventarioEquipamento.create({
    data: {
      ...data,
      consumoMensalKwh: new Prisma.Decimal(consumoMensalKwh.toFixed(2)),
    },
  });
}

export async function atualizarEquipamento(id: string, data: Partial<{
  descricao: string;
  quantidade: number;
  potenciaWatts: number;
  horasDia: number;
  diasMes: number;
}>) {
  // Se mudar algum valor técnico, recalcula o consumo
  if (data.potenciaWatts || data.horasDia || data.diasMes || data.quantidade) {
    const atual = await prisma.inventarioEquipamento.findUnique({ where: { id } });
    if (atual) {
      const q = data.quantidade ?? atual.quantidade;
      const p = data.potenciaWatts ?? Number(atual.potenciaWatts);
      const h = data.horasDia ?? Number(atual.horasDia);
      const d = data.diasMes ?? atual.diasMes;
      
      const novoConsumo = (p * h * d * q) / 1000;
      (data as any).consumoMensalKwh = new Prisma.Decimal(novoConsumo.toFixed(2));
    }
  }

  return prisma.inventarioEquipamento.update({
    where: { id },
    data,
  });
}

export async function excluirEquipamento(id: string) {
  return prisma.inventarioEquipamento.delete({
    where: { id },
  });
}
