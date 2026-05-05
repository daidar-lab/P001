
import prisma from './src/config/database';
import { obterEstatisticas } from './src/modules/relatorios/relatorios.service';

async function main() {
  try {
    console.log("Tentando conectar ao banco...");
    const count = await prisma.relatorio.count();
    console.log("Conexão OK. Total relatórios:", count);

    console.log("Tentando obter estatísticas...");
    const stats = await obterEstatisticas();
    console.log("Estatísticas obtidas com sucesso!");
    console.log(JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error("ERRO DETECTADO:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
