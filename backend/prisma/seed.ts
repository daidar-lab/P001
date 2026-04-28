import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding...');

  // 1. Limpar dados existentes (opcional, mas bom para testes)
  await prisma.fatura.deleteMany();
  await prisma.relatorio.deleteMany();
  await prisma.cliente.deleteMany();

  // 2. Criar Clientes
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: 'Audit Energy Solutions',
      cnpj: '12.345.678/0001-90',
      endereco: 'Av. Paulista, 1000',
      cidade: 'São Paulo',
      responsavel: 'Marcos Energia',
      emailFinanceiro: 'financeiro@auditenergy.com',
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: 'Indústria Metalúrgica ABC',
      cnpj: '98.765.432/0001-21',
      endereco: 'Distrito Industrial, s/n',
      cidade: 'São Bernardo do Campo',
      responsavel: 'Eng. Roberto',
    },
  });

  console.log('✅ Clientes criados');

  // 3. Criar Relatórios com diferentes status
  const statusList: any[] = [
    'processado', 'processado', 'processado', 'processado', 
    'pronto_revisao', 'pronto_revisao', 'validado', 'carregado', 'falha'
  ];

  for (let i = 1; i <= 12; i++) {
    const status = statusList[i % statusList.length];
    const relatorio = await prisma.relatorio.create({
      data: {
        codigoRelatorio: `REL-2026-${i.toString().padStart(3, '0')}`,
        titulo: `Auditoria Energética Mensal - Unidade ${i}`,
        clienteId: i % 2 === 0 ? cliente1.id : cliente2.id,
        status: status,
        periodoReferencia: new Date(2026, 0, 1), // Jan 2026
        criadoPor: 'Sistema (Seed)',
      },
    });

    // 4. Criar Faturas para os relatórios processados (para o gráfico)
    if (status === 'processado' || status === 'pronto_revisao') {
      await prisma.fatura.create({
        data: {
          relatorioId: relatorio.id,
          numeroLinha: 1,
          clienteNome: i % 2 === 0 ? cliente1.nome : cliente2.nome,
          concessionaria: 'ENEL',
          numeroUnidade: `UN-${100 + i}`,
          consumoKwh: 800 + Math.random() * 500,
          valorTotal: 1200 + Math.random() * 800,
          valorCip: 45.50,
          periodoReferencia: new Date(2026, 0, 1),
        },
      });
    }
  }

  console.log('✅ Relatórios e faturas de exemplo criados');
  console.log('✨ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
