import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import prisma from '../../config/database';
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

export interface GerarPdfOptions {
  relatorioId: string;
  responsavel?: string;
}

export async function gerarRelatorioPdf(options: GerarPdfOptions): Promise<string> {
  const { relatorioId, responsavel = 'Departamento de Engenharia' } = options;

  // 1. Buscar dados consolidados
  const relatorio = await prisma.relatorio.findUnique({
    where: { id: relatorioId },
    include: {
      faturas: true,
      cliente: true,
    },
  });

  if (!relatorio) throw new Error('Relatório não encontrado');

  // Buscar equipamentos do cliente (Inventário)
  const equipamentos = await prisma.equipamento.findMany({
    where: { clienteId: relatorio.clienteId || undefined },
  });

  // 2. Preparar cálculos para o template
  const faturasProcessadas = relatorio.faturas.map(f => ({
    descricao: `Consumo Ativo — ${f.periodoReferencia ? new Date(f.periodoReferencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : ''}`,
    registrado: f.consumoKwh?.toLocaleString('pt-BR') || '0',
    faturado: f.consumoKwh?.toLocaleString('pt-BR') || '0',
    unidade: 'kWh',
    tarifa: f.tarifaUnitaria?.toFixed(4) || '0.0000',
    valor: f.valorTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00',
  }));

  const valorTotalFaturas = relatorio.faturas.reduce((acc, f) => acc + (f.valorTotal || 0), 0);
  const consumoTotalFaturas = relatorio.faturas.reduce((acc, f) => acc + (f.consumoKwh || 0), 0);
  const tarifaMedia = consumoTotalFaturas > 0 ? valorTotalFaturas / consumoTotalFaturas : 0;

  const listaEquipamentos = equipamentos.map(e => {
    const consumoMensal = ((e.potenciaWatts || 0) * (e.horasDia || 0) * (e.diasMes || 30)) / 1000;
    return {
      ...e,
      consumoMensalKwh: consumoMensal.toFixed(2),
    };
  });

  const consumoEstimadoTotal = listaEquipamentos.reduce((acc, e) => acc + parseFloat(e.consumoMensalKwh), 0);
  const divergencia = consumoTotalFaturas > 0 ? ((consumoEstimadoTotal - consumoTotalFaturas) / consumoTotalFaturas) * 100 : 0;

  // 3. Gerar Resumo IA via Ollama
  const prompt = `
    Aja como um consultor sênior em eficiência energética. 
    Analise os seguintes dados de uma fatura de energia e do inventário de equipamentos do cliente ${relatorio.cliente?.nome || 'Cliente'}.
    
    DADOS DA FATURA:
    - Consumo Real: ${consumoTotalFaturas} kWh
    - Valor Total: R$ ${valorTotalFaturas.toFixed(2)}
    - Tarifa Unitária: R$ ${tarifaMedia.toFixed(4)}/kWh
    
    INVENTÁRIO DE EQUIPAMENTOS (ESTIMADO):
    - Consumo Estimado Total: ${consumoEstimadoTotal.toFixed(2)} kWh
    - Divergência (Estimado vs Real): ${divergencia.toFixed(2)}%
    - Equipamentos: ${equipamentos.map(e => `${e.descricao} (${e.quantidade}x ${e.potenciaWatts}W)`).join(', ')}
    
    INSTRUÇÕES:
    - Escreva uma conclusão técnica e executiva para o relatório.
    - Use parágrafos claros.
    - Destaque se a divergência entre o inventário e a fatura está dentro do esperado (aceitável até 10%).
    - Sugira oportunidades de economia baseadas nos dados (ex: se o consumo for alto, sugerir solar ou troca de equipamentos).
    - Formate em HTML (use tags <p>, <strong>, <ul>, <li>).
    - Mantenha um tom profissional e assertivo.
    - NÃO use saudações, foque apenas no corpo do texto da conclusão.
  `;

  let conclusaoIa = "Não foi possível gerar a análise automática no momento.";
  try {
    const response = await ollama.generate({
      model: 'llama3', // ou mistral, etc.
      prompt: prompt,
      stream: false
    });
    conclusaoIa = response.response;
  } catch (error) {
    console.error('[OLLAMA] Erro ao gerar conclusão:', error);
  }

  // 4. Renderizar Template
  const templatePath = path.join(__dirname, '../../templates/relatorios/fatura-analise.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateHtml);

  const htmlFinal = template({
    clienteLogo: 'https://auditenergy.com.br/placeholder-logo.png', // Placeholder ou do cliente
    coverImage: 'https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?q=80&w=2070&auto=format&fit=crop',
    periodoReferencia: relatorio.periodoReferencia ? new Date(relatorio.periodoReferencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase() : 'N/A',
    responsavel,
    clienteNome: relatorio.cliente?.nome || 'N/A',
    clienteCnpj: relatorio.cliente?.cnpj || 'N/A',
    concessionaria: relatorio.faturas[0]?.concessionaria || 'N/A',
    numeroUnidade: relatorio.faturas[0]?.numeroUnidade || 'N/A',
    periodoMedicao: relatorio.faturas[0]?.periodoMedicaoInicio 
      ? `${new Date(relatorio.faturas[0].periodoMedicaoInicio).toLocaleDateString('pt-BR')} a ${new Date(relatorio.faturas[0].periodoMedicaoFim!).toLocaleDateString('pt-BR')}`
      : 'N/A',
    enquadramento: relatorio.faturas[0]?.classeTarifaria || 'B3 - Convencional',
    faturasItem: faturasProcessadas,
    valorTotal: valorTotalFaturas.toLocaleString('pt-BR'),
    tarifaUnitaria: tarifaMedia.toFixed(4),
    percentualTributos: "22,30", // Placeholder ou calculado
    equipamentos: listaEquipamentos,
    consumoEstimadoTotal: consumoEstimadoTotal.toFixed(2),
    consumoRealTotal: consumoTotalFaturas.toLocaleString('pt-BR'),
    percentualDivergencia: Math.abs(divergencia).toFixed(2),
    divergenciaCor: Math.abs(divergencia) > 15 ? '#ef4444' : '#10b981',
    conclusaoIa: conclusaoIa
  });

  // 5. Gerar PDF com Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });
  
  const pdfPath = path.join(__dirname, `../../../uploads/pdfs/relatorio-${relatorio.codigoRelatorio}.pdf`);
  
  // Garantir diretório existe
  const dir = path.dirname(pdfPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();

  // 6. Atualizar caminho do PDF no banco
  await prisma.relatorio.update({
    where: { id: relatorioId },
    data: { 
      status: 'processado',
      // Aqui poderíamos ter um campo arquivoPdfId futuramente
    },
  });

  return pdfPath;
}
