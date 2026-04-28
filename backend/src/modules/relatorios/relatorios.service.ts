// Relatórios Service — Lógica de negócio
import prisma from '../../config/database';

export async function listarRelatorios(
  page = 1,
  limit = 20,
  status?: string,
  clienteId?: string,
  dataInicio?: string,
  dataFim?: string
) {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (clienteId) where.clienteId = clienteId;
  
  if (dataInicio || dataFim) {
    where.criadoEm = {};
    if (dataInicio) where.criadoEm.gte = new Date(dataInicio);
    if (dataFim) where.criadoEm.lte = new Date(dataFim);
  }

  const [relatorios, total] = await Promise.all([
    prisma.relatorio.findMany({
      where,
      skip,
      take: limit,
      orderBy: { criadoEm: 'desc' },
      include: {
        cliente: {
          select: { id: true, nome: true, cnpj: true },
        },
        arquivoCsv: {
          select: { id: true, nomeArquivo: true, quantidadeLinhas: true },
        },
        _count: {
          select: { faturas: true },
        },
      },
    }),
    prisma.relatorio.count({ where }),
  ]);

  return {
    data: relatorios,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function buscarRelatorio(id: string) {
  return prisma.relatorio.findUnique({
    where: { id },
    include: {
      cliente: true,
      arquivoCsv: true,
      template: true,
      faturas: {
        orderBy: { numeroLinha: 'asc' },
      },
      historicoProcessamento: {
        orderBy: { criadoEm: 'asc' },
      },
      statusFluxoTrabalho: {
        orderBy: { etapa: 'asc' },
      },
      analisesIa: true,
      _count: {
        select: {
          faturas: true,
          rastreabilidadeCampos: true,
        },
      },
    },
  });
}

export async function buscarRastreabilidade(relatorioId: string) {
  return prisma.rastreabilidadeCampo.findMany({
    where: { relatorioId },
    orderBy: { criadoEm: 'asc' },
  });
}

export async function obterEstatisticas() {
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

  const [totalRelatorios, porStatus, ultimosRelatorios, enviadosRecentemente] = await Promise.all([
    prisma.relatorio.count(),
    prisma.relatorio.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.relatorio.findMany({
      take: 5,
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        codigoRelatorio: true,
        titulo: true,
        status: true,
        criadoEm: true,
        cliente: {
          select: { nome: true },
        },
      },
    }),
    prisma.relatorio.findMany({
      where: {
        status: 'enviado',
        atualizadoEm: { gte: seteDiasAtras }
      },
      select: { atualizadoEm: true }
    })
  ]);

  // Processar dados para o gráfico (agrupar por dia)
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const enviadosPorDia = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = diasSemana[d.getDay()];
    const count = enviadosRecentemente.filter(r => 
      new Date(r.atualizadoEm).toDateString() === d.toDateString()
    ).length;
    return { name: label, total: count };
  }).reverse();

  return {
    totalRelatorios,
    porStatus: porStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    ),
    ultimosRelatorios,
    enviadosPorDia
  };
}
