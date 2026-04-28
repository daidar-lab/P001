// Pipeline Etapa 3 — Processamento
// Parse de dados, inserção em faturas, cálculos derivados e rastreabilidade
import prisma from '../../config/database';
import { parseCsvFile } from '../../modules/faturas/csv-parser';
import { parseDate, parseNumber } from '../../utils/date-utils';
import { sanitizeScientificNotation } from '../../utils/string-utils';
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
    const { rows } = await parseCsvFile(csvFilePath);

    let faturasInseridas = 0;
    let camposRastreados = 0;

    // Processar em transação
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const numeroLinha = i + 1;

        // Campos diretos do CSV com higienização de notação científica
        const periodoReferencia = parseDate(row.periodo_referencia);
        const clienteNome = sanitizeScientificNotation(row.cliente_nome);
        const numeroUnidade = sanitizeScientificNotation(row.numero_unidade);
        const concessionaria = sanitizeScientificNotation(row.concessionaria);
        const periodoMedicaoInicio = parseDate(row.periodo_medicao_inicio);
        const periodoMedicaoFim = parseDate(row.periodo_medicao_fim);
        const classeTarifaria = sanitizeScientificNotation(row.classe_tarifaria);
        const dataEmissao = parseDate(row.data_emissao);
        const valorTotal = parseNumber(row.valor_total);
        const consumoKwh = parseNumber(row.consumo_kwh);
        const valorCip = parseNumber(row.valor_cip);
        const bandeiraTarifaria = sanitizeScientificNotation(row.bandeira_tarifaria);
        const consumoKwhMesAnterior = parseNumber(row.consumo_kwh_mes_anterior);

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

        // Atualizar período de referência no relatório (do primeiro registro)
        if (i === 0 && periodoReferencia) {
          await tx.relatorio.update({
            where: { id: relatorioId },
            data: { periodoReferencia },
          });
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
            valorTotal,
            consumoKwh,
            tarifaUnitaria,
            valorCip,
            bandeiraTarifaria,
            consumoKwhMesAnterior,
            consumoKwhMedia: mediaConsumo,
            diferencaPercentual,
            metadadosOrigem: row as any,
          },
        });

        faturasInseridas++;

        // Registrar rastreabilidade de campos
        const camposRastreabilidade = [
          // Campos diretos
          { campo: 'periodo_referencia', valor: row.periodo_referencia, tipo: 'csv_direto' as const },
          { campo: 'cliente_nome', valor: row.cliente_nome, tipo: 'csv_direto' as const },
          { campo: 'numero_unidade', valor: row.numero_unidade, tipo: 'csv_direto' as const },
          { campo: 'concessionaria', valor: row.concessionaria, tipo: 'csv_direto' as const },
          { campo: 'periodo_medicao_inicio', valor: row.periodo_medicao_inicio, tipo: 'csv_direto' as const },
          { campo: 'periodo_medicao_fim', valor: row.periodo_medicao_fim, tipo: 'csv_direto' as const },
          { campo: 'classe_tarifaria', valor: row.classe_tarifaria, tipo: 'csv_direto' as const },
          { campo: 'data_emissao', valor: row.data_emissao, tipo: 'csv_direto' as const },
          { campo: 'valor_total', valor: row.valor_total, tipo: 'csv_direto' as const },
          { campo: 'consumo_kwh', valor: row.consumo_kwh, tipo: 'csv_direto' as const },
          { campo: 'valor_cip', valor: row.valor_cip, tipo: 'csv_direto' as const },
          { campo: 'bandeira_tarifaria', valor: row.bandeira_tarifaria, tipo: 'csv_direto' as const },
          { campo: 'consumo_kwh_mes_anterior', valor: row.consumo_kwh_mes_anterior, tipo: 'csv_direto' as const },
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
