import { gerarRelatorioPdf } from '../src/modules/relatorios/relatorio-pdf.service';
import prisma from '../src/config/database';

async function testGeneration() {
  try {
    const relatorio = await prisma.relatorio.findFirst({
      orderBy: { criadoEm: 'desc' },
    });

    if (!relatorio) {
      console.log('Nenhum relatório encontrado.');
      return;
    }

    console.log(`Gerando PDF para relatório: ${relatorio.id}...`);
    const path = await gerarRelatorioPdf({ relatorioId: relatorio.id });
    console.log(`PDF gerado em: ${path}`);

  } catch (error) {
    console.error('Erro no teste de geração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGeneration();
