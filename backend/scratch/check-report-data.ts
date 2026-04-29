import prisma from '../src/config/database';

async function checkData() {
  try {
    const relatorio = await prisma.relatorio.findFirst({
      orderBy: { criadoEm: 'desc' },
      include: {
        faturas: true,
        cliente: true,
      },
    });

    if (!relatorio) {
      console.log('Nenhum relatório encontrado.');
      return;
    }

    console.log(`Relatório ID: ${relatorio.id}`);
    console.log(`Status: ${relatorio.status}`);
    console.log(`Cliente: ${relatorio.cliente?.nome || 'N/A'}`);
    console.log(`Faturas: ${relatorio.faturas.length}`);
    
    if (relatorio.faturas.length > 0) {
      const consumoTotal = relatorio.faturas.reduce((acc, f) => acc + Number(f.consumoKwh || 0), 0);
      console.log(`Consumo Total: ${consumoTotal} kWh`);
    }

    const equipamentos = await prisma.inventarioEquipamento.findMany({
      where: { clienteId: relatorio.clienteId || undefined },
    });
    console.log(`Equipamentos: ${equipamentos.length}`);

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
