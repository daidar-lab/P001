import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed para o cliente DAVI...");

  // 1. Criar Cliente Davi
  const cliente = await prisma.cliente.upsert({
    where: { cnpj: "00.000.000/0001-00" },
    update: {
      emailFinanceiro: "daidar@cervejariacidadeimperial.com.br",
    },
    create: {
      nome: "Davi — Teste Real",
      cnpj: "00.000.000/0001-00",
      emailFinanceiro: "daidar@cervejariacidadeimperial.com.br",
      endereco: "Rua do Sucesso, 777 - Auditoria/SP",
    },
  });

  console.log(`✅ Cliente criado: ${cliente.nome} (${cliente.emailFinanceiro})`);

  // 2. Criar Inventário para Davi
  const equipamentosData = [
    { descricao: "Ar Condicionado Inverter 12k", quantidade: 3, potenciaWatts: 1200, horasDia: 10, diasMes: 30, consumoMensalKwh: 1080 },
    { descricao: "Servidor de Dados", quantidade: 1, potenciaWatts: 500, horasDia: 24, diasMes: 30, consumoMensalKwh: 360 },
    { descricao: "Iluminação Escritório (LED)", quantidade: 40, potenciaWatts: 10, horasDia: 12, diasMes: 22, consumoMensalKwh: 105.6 },
    { descricao: "Cafeteira Expressa", quantidade: 1, potenciaWatts: 1500, horasDia: 2, diasMes: 22, consumoMensalKwh: 66 },
  ];

  // Limpar inventário antigo do Davi
  await prisma.inventarioEquipamento.deleteMany({ where: { clienteId: cliente.id } });

  for (const eq of equipamentosData) {
    await prisma.inventarioEquipamento.create({
      data: {
        ...eq,
        clienteId: cliente.id,
      },
    });
  }

  console.log(`✅ Inventário do Davi configurado.`);

  // 3. Criar Relatório e Faturas
  const codigoDemo = "AUDIT-DAVI-001";
  await prisma.relatorio.deleteMany({ where: { codigoRelatorio: codigoDemo } });

  const relatorio = await prisma.relatorio.create({
    data: {
      codigoRelatorio: codigoDemo,
      titulo: "Relatório de Auditoria Energética — Davi",
      status: "processado",
      clienteId: cliente.id,
      periodoReferencia: new Date("2026-01-01"),
      criadoPor: "Davi",
    },
  });

  // Faturas Históricas para o gráfico do Davi
  const historico = [
    { mes: "2025-08-01", consumo: 1400, valor: 1200.00 },
    { mes: "2025-09-01", consumo: 1550, valor: 1350.50 },
    { mes: "2025-10-01", consumo: 1600, valor: 1400.00 },
    { mes: "2025-11-01", consumo: 1650, valor: 1450.00 },
    { mes: "2025-12-01", consumo: 1700, valor: 1550.00 },
    { mes: "2026-01-01", consumo: 1680, valor: 1530.00 },
  ];

  for (let i = 0; i < historico.length; i++) {
    const h = historico[i];
    await prisma.fatura.create({
      data: {
        relatorioId: relatorio.id,
        numeroLinha: i + 1,
        clienteNome: cliente.nome,
        numeroUnidade: "DAVI-777",
        concessionaria: "AUDIT POWER",
        periodoReferencia: new Date(h.mes),
        consumoKwh: h.consumo,
        valorTotal: h.valor,
        tarifaUnitaria: 0.91,
      },
    });
  }

  console.log(`✅ Histórico de faturas do Davi criado.`);
  console.log(`🚀 Pipeline pronto para o Davi! ID: ${relatorio.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
