// Pipeline Etapa 3 — Processamento
// Parse de dados, inserção em faturas, cálculos derivados e rastreabilidade
import prisma from '../../config/database';
import { parseAnyFile } from '../../modules/faturas/csv-parser';
import { parseDate, parseNumber } from '../../utils/date-utils';
import { sanitizeScientificNotation } from '../../utils/string-utils';
import { getMappedValue } from '../../modules/faturas/csv-validator';
import {
  calcularTarifaUnitaria,
  calcularMediaConsumo,
  calcularDiferencaPercentual,
} from '../../utils/calculations';

export interface ProcessResult {
  relatorioId: string;
  faturasInseridas: number;
  camposRastreados: number;
}

/**
 * Etapa 3: Processa o CSV — insere faturas e calcula campos derivados
 * - Parse de cada linha do CSV
 * - Insere em faturas com campos diretos
 * - Calcula campos derivados (tarifa unitária, média consumo, diferença %)
 * - Registra rastreabilidade de cada campo
 */
export async function step3Process(
  relatorioId: string,
  csvFilePath: string
): Promise<ProcessResult> {
  const startTime = Date.now();

  // Atualizar status para 'processando'
  await prisma.relatorio.update({
    where: { id: relatorioId },
    data: { status: 'processando' },
  });

  const historico = await prisma.historicoProcessamento.create({
    data: {
      relatorioId,
      etapa: 'validacao', // etapa genérica — processamento usa mesma enum
      estado: 'executando',
      iniciadoEm: new Date(),
    },
  });

  try {
    const { rows } = await parseAnyFile(csvFilePath);

    let faturasInseridas = 0;
    let camposRastreados = 0;

    // Processar em transação
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const numeroLinha = i + 1;

        // Campos diretos do CSV com mapeamento flexível e higienização
        const rawPeriodoReferencia = getMappedValue(row, 'periodo_referencia');
        const rawClienteNome = getMappedValue(row, 'cliente_nome');
        const rawNumeroUnidade = getMappedValue(row, 'numero_unidade');
        const rawConcessionaria = getMappedValue(row, 'concessionaria');
        const rawPeriodoMedicaoInicio = getMappedValue(row, 'periodo_medicao_inicio');
        const rawPeriodoMedicaoFim = getMappedValue(row, 'periodo_medicao_fim');
        const rawClasseTarifaria = getMappedValue(row, 'classe_tarifaria');
        const rawDataEmissao = getMappedValue(row, 'data_emissao');
        const rawValorTotal = getMappedValue(row, 'valor_total');
        const rawConsumoKwh = getMappedValue(row, 'consumo_kwh');
        const rawValorCip = getMappedValue(row, 'valor_cip');
        const rawBandeiraTarifaria = getMappedValue(row, 'bandeira_tarifaria');
        const rawConsumoKwhMesAnterior = getMappedValue(row, 'consumo_kwh_mes_anterior');

        const periodoReferencia = parseDate(rawPeriodoReferencia || '');
        const clienteNome = sanitizeScientificNotation(rawClienteNome || '');
        const numeroUnidade = sanitizeScientificNotation(rawNumeroUnidade || '');
        const concessionaria = sanitizeScientificNotation(rawConcessionaria || '');
        const periodoMedicaoInicio = parseDate(rawPeriodoMedicaoInicio || '');
        const periodoMedicaoFim = parseDate(rawPeriodoMedicaoFim || '');
        const classeTarifaria = sanitizeScientificNotation(rawClasseTarifaria || '');
        const dataEmissao = parseDate(rawDataEmissao || '');
        const valorTotal = parseNumber(rawValorTotal || '0');
        const consumoKwh = parseNumber(rawConsumoKwh || '0');
        const valorCip = parseNumber(rawValorCip || '0');
        const bandeiraTarifaria = sanitizeScientificNotation(rawBandeiraTarifaria || '');
        const consumoKwhMesAnterior = parseNumber(rawConsumoKwhMesAnterior || '0');

        // Campos calculados
        const tarifaUnitaria =
          valorTotal != null && consumoKwh != null
            ? calcularTarifaUnitaria(valorTotal, consumoKwh)
            : null;

        const mediaConsumo =
          consumoKwh != null && consumoKwhMesAnterior != null
            ? calcularMediaConsumo(consumoKwh, consumoKwhMesAnterior)
            : null;

        const diferencaPercentual =
          consumoKwh != null && consumoKwhMesAnterior != null
            ? calcularDiferencaPercentual(consumoKwh, consumoKwhMesAnterior)
            : null;

        // ─── ASSOCIAÇÃO AUTOMÁTICA DE CLIENTE (Novo) ───
        if (i === 0 && clienteNome) {
          // Busca cliente por nome (ignora case e acentos se possível, ou busca exata simples aqui)
          const cliente = await tx.cliente.findFirst({
            where: {
              nome: {
                contains: clienteNome,
                mode: 'insensitive'
              }
            }
          });

          if (cliente) {
            console.log(`[PIPELINE] Cliente identificado: ${cliente.nome} (${cliente.id})`);
            await tx.relatorio.update({
              where: { id: relatorioId },
              data: { 
                clienteId: cliente.id,
                periodoReferencia // já estava planejado
              },
            });
          } else {
            console.warn(`[PIPELINE] Cliente "${clienteNome}" não encontrado no cadastro.`);
            await tx.relatorio.update({
              where: { id: relatorioId },
              data: { periodoReferencia },
            });
          }
        }

        // Inserir fatura
        const fatura = await tx.fatura.create({
          data: {
            relatorioId,
            numeroLinha,
            periodoReferencia,
            clienteNome,
            numeroUnidade,
            concessionaria,
            periodoMedicaoInicio,
            periodoMedicaoFim,
            classeTarifaria,
            dataEmissao,
            valorTotal: valorTotal || 0,
            consumoKwh: consumoKwh || 0,
            tarifaUnitaria: tarifaUnitaria || 0,
            valorCip: valorCip || 0,
            bandeiraTarifaria,
            consumoKwhMesAnterior: consumoKwhMesAnterior || 0,
            consumoKwhMedia: mediaConsumo || 0,
            diferencaPercentual: diferencaPercentual || 0,
            metadadosOrigem: row as any,
          },
        });

        faturasInseridas++;

        // Registrar rastreabilidade de campos
        const camposRastreabilidade = [
          // Campos diretos
          { campo: 'periodo_referencia', valor: rawPeriodoReferencia, tipo: 'csv_direto' as const },
          { campo: 'cliente_nome', valor: rawClienteNome, tipo: 'csv_direto' as const },
          { campo: 'numero_unidade', valor: rawNumeroUnidade, tipo: 'csv_direto' as const },
          { campo: 'concessionaria', valor: rawConcessionaria, tipo: 'csv_direto' as const },
          { campo: 'periodo_medicao_inicio', valor: rawPeriodoMedicaoInicio, tipo: 'csv_direto' as const },
          { campo: 'periodo_medicao_fim', valor: rawPeriodoMedicaoFim, tipo: 'csv_direto' as const },
          { campo: 'classe_tarifaria', valor: rawClasseTarifaria, tipo: 'csv_direto' as const },
          { campo: 'data_emissao', valor: rawDataEmissao, tipo: 'csv_direto' as const },
          { campo: 'valor_total', valor: rawValorTotal, tipo: 'csv_direto' as const },
          { campo: 'consumo_kwh', valor: rawConsumoKwh, tipo: 'csv_direto' as const },
          { campo: 'valor_cip', valor: rawValorCip, tipo: 'csv_direto' as const },
          { campo: 'bandeira_tarifaria', valor: rawBandeiraTarifaria, tipo: 'csv_direto' as const },
          { campo: 'consumo_kwh_mes_anterior', valor: rawConsumoKwhMesAnterior, tipo: 'csv_direto' as const },
          // Campos calculados
          { campo: 'tarifa_unitaria', valor: tarifaUnitaria?.toString() || null, tipo: 'calculado' as const },
          { campo: 'consumo_kwh_media', valor: mediaConsumo?.toString() || null, tipo: 'calculado' as const },
          { campo: 'diferenca_percentual', valor: diferencaPercentual?.toString() || null, tipo: 'calculado' as const },
        ];

        for (const campo of camposRastreabilidade) {
          await tx.rastreabilidadeCampo.create({
            data: {
              relatorioId,
              nomeCampo: `fatura_${numeroLinha}_${campo.campo}`,
              valorPreenchido: campo.valor || null,
              tipoOrigem: campo.tipo,
              origemEspecifica: campo.tipo === 'csv_direto'
                ? `CSV coluna "${campo.campo}" linha ${numeroLinha}`
                : `Calculado a partir de campos CSV linha ${numeroLinha}`,
            },
          });
          camposRastreados++;
        }
      }
    });

    const duration = Date.now() - startTime;

    // Atualizar status
    await prisma.relatorio.update({
      where: { id: relatorioId },
      data: { status: 'processado' },
    });

    await prisma.historicoProcessamento.update({
      where: { id: historico.id },
      data: {
        estado: 'sucesso',
        finalizadoEm: new Date(),
        duracaoMs: duration,
        detalhes: {
          faturasInseridas,
          camposRastreados,
        },
      },
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        tipoObjeto: 'relatorio',
        idObjeto: relatorioId,
        acao: 'processado',
        mensagem: `${faturasInseridas} faturas processadas, ${camposRastreados} campos rastreados`,
      },
    });

    return { relatorioId, faturasInseridas, camposRastreados };
  } catch (error) {
    const duration = Date.now() - startTime;

    await prisma.relatorio.update({
      where: { id: relatorioId },
      data: { status: 'falha' },
    });

    await prisma.historicoProcessamento.update({
      where: { id: historico.id },
      data: {
        estado: 'falha',
        finalizadoEm: new Date(),
        duracaoMs: duration,
        detalhes: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      },
    });

    throw error;
  }
}
