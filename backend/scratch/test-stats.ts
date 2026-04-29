import { obterEstatisticas } from '../src/modules/relatorios/relatorios.service';
import prisma from '../src/config/database';

async function testStats() {
  console.log('Testando obterEstatisticas...');
  const stats = await obterEstatisticas();
  console.log('Stats Result:', JSON.stringify(stats, null, 2));
  await prisma.$disconnect();
}

testStats();
