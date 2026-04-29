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
  const equipamentos = await prisma.inventarioEquipamento.findMany({
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

  const valorTotalFaturas = relatorio.faturas.reduce((acc, f) => acc + Number(f.valorTotal || 0), 0);
  const consumoTotalFaturas = relatorio.faturas.reduce((acc, f) => acc + Number(f.consumoKwh || 0), 0);
  const tarifaMedia = consumoTotalFaturas > 0 ? valorTotalFaturas / consumoTotalFaturas : 0;

  const listaEquipamentos = equipamentos.map(e => {
    const consumoMensal = (Number(e.potenciaWatts || 0) * Number(e.horasDia || 0) * (e.diasMes || 30)) / 1000;
    return {
      ...e,
      descricao: e.descricao || 'Equipamento',
      quantidade: e.quantidade || 1,
      potenciaWatts: Number(e.potenciaWatts || 0),
      horasDia: Number(e.horasDia || 0),
      consumoMensalKwh: consumoMensal.toFixed(2),
    };
  });

  const consumoEstimadoTotal = listaEquipamentos.reduce((acc, e) => acc + parseFloat(e.consumoMensalKwh), 0);
  const divergencia = consumoTotalFaturas > 0 ? ((consumoEstimadoTotal - consumoTotalFaturas) / consumoTotalFaturas) * 100 : 0;

  // 3. Gerar Resumo IA via Ollama
  const clientInfo = relatorio.cliente 
    ? `do cliente ${relatorio.cliente.nome} (CNPJ: ${relatorio.cliente.cnpj})` 
    : `do cliente identificado como "${relatorio.faturas[0]?.clienteNome || 'Desconhecido'}" no CSV`;

  const prompt = `
    Aja como um consultor sênior em eficiência energética. 
    Analise os seguintes dados de uma fatura de energia e do inventário de equipamentos ${clientInfo}.
    
    DADOS DA FATURA:
    - Consumo Real: ${consumoTotalFaturas} kWh
    - Valor Total: R$ ${valorTotalFaturas.toFixed(2)}
    - Tarifa Unitária: R$ ${tarifaMedia.toFixed(4)}/kWh
    
    INVENTÁRIO DE EQUIPAMENTOS (ESTIMADO):
    - Consumo Estimado Total: ${consumoEstimadoTotal.toFixed(2)} kWh
    - Divergência (Estimado vs Real): ${divergencia.toFixed(2)}%
    ${equipamentos.length > 0 
      ? `- Equipamentos: ${equipamentos.map(e => `${e.descricao} (${e.quantidade}x ${e.potenciaWatts}W)`).join(', ')}` 
      : '- OBSERVAÇÃO: Não há equipamentos cadastrados no inventário deste cliente.'}
    
    INSTRUÇÕES:
    - Escreva uma conclusão técnica e executiva para o relatório.
    - Se o inventário estiver vazio, destaque a importância de cadastrar os equipamentos para uma análise de divergência precisa.
    - Se a divergência for alta (fora de 10-15%), sugira auditoria nos equipamentos ou verificação de erros na fatura.
    - Use parágrafos claros.
    - Formate OBRIGATORIAMENTE em HTML (use tags <p>, <strong>, <ul>, <li>).
    - Mantenha um tom profissional e assertivo.
    - NÃO use saudações ou introduções, comece direto na análise técnica.
  `;

  let conclusaoIa = "Não foi possível gerar a análise automática no momento.";
  try {
    console.log(`[OLLAMA] Gerando conclusão para relatório ${relatorioId}...`);
    const response = await ollama.generate({
      model: 'llama3', 
      prompt: prompt,
      stream: false
    });
    
    if (response.response && response.response.trim().length > 0) {
      conclusaoIa = response.response;
      console.log(`[OLLAMA] Conclusão gerada com sucesso (${conclusaoIa.length} caracteres)`);
    } else {
      console.warn(`[OLLAMA] Resposta vazia do modelo para o relatório ${relatorioId}`);
      conclusaoIa = `
        <p><strong>Análise Técnica:</strong> O consumo registrado no período (${consumoTotalFaturas} kWh) foi processado.</p>
        <p>Não foi possível gerar uma recomendação detalhada via IA no momento, mas recomendamos a revisão do inventário de equipamentos para identificar possíveis discrepâncias.</p>
      `;
    }
  } catch (error) {
    console.error('[OLLAMA] Erro ao gerar conclusão:', error);
    conclusaoIa = `
      <p><strong>Aviso:</strong> A análise automática de IA está temporariamente indisponível.</p>
      <p>Consumo Real: ${consumoTotalFaturas} kWh. Valor Total: R$ ${valorTotalFaturas.toFixed(2)}.</p>
    `;
  }

  // Carregar Logo Audit Energy em Base64
  let auditLogoBase64 = '';
  try {
    const logoPath = path.join(__dirname, '../../public/images/logo-audit.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      auditLogoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
  } catch (err) {
    console.error('Erro ao carregar logo para o PDF:', err);
  }

  // Dados para o gráfico (últimos meses ordenados)
  const consumoHistorico = relatorio.faturas
    .filter(f => f.periodoReferencia)
    .sort((a, b) => new Date(a.periodoReferencia!).getTime() - new Date(b.periodoReferencia!).getTime())
    .map(f => ({
      mes: new Date(f.periodoReferencia!).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
      consumo: Number(f.consumoKwh || 0)
    }));

  // 4. Renderizar Template
  const templatePath = path.join(__dirname, '../../templates/relatorios/fatura-analise.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateHtml);

  const htmlFinal = template({
    auditLogo: auditLogoBase64,
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
    percentualTributos: "22,30", 
    equipamentos: listaEquipamentos,
    consumoEstimadoTotal: consumoEstimadoTotal.toFixed(2),
    consumoRealTotal: consumoTotalFaturas.toLocaleString('pt-BR'),
    percentualDivergencia: Math.abs(divergencia).toFixed(2),
    divergenciaCor: Math.abs(divergencia) > 15 ? '#ef4444' : '#10b981',
    conclusaoIa: conclusaoIa,
    chartLabels: JSON.stringify(consumoHistorico.map(h => h.mes)),
    chartValues: JSON.stringify(consumoHistorico.map(h => h.consumo))
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
    },
  });

  // 7. Envio Automático de E-mail (Opcional se houver e-mail do cliente)
  if (relatorio.cliente?.emailFinanceiro) {
    const { enviarRelatorioPorEmail } = await import('../../services/email.service');
    const mesRef = relatorio.periodoReferencia 
      ? new Date(relatorio.periodoReferencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : 'Período Atual';

    await enviarRelatorioPorEmail({
      to: relatorio.cliente.emailFinanceiro,
      clienteNome: relatorio.cliente.nome,
      periodoReferencia: mesRef,
      pdfPath: pdfPath
    });
  }

  return pdfPath;
}
