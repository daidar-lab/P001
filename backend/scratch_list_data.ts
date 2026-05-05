
import prisma from './src/config/database';

async function main() {
  try {
    const totalClientes = await prisma.cliente.count();
    console.log("Total Clientes no Banco:", totalClientes);

    const clientes = await prisma.cliente.findMany({
      take: 5,
      select: { id: true, nome: true, cnpj: true }
    });
    console.log("Amostra de Clientes:", JSON.stringify(clientes, null, 2));

    const totalRelatorios = await prisma.relatorio.count();
    console.log("Total Relatórios no Banco:", totalRelatorios);

  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
