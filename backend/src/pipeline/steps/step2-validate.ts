// Pipeline Etapa 2 — Validação
// Validação estrutural e de tipos do CSV
import prisma from '../../config/database';
import { parseAnyFile } from '../../modules/faturas/csv-parser';
import { validateCsvStructure, ValidationResult } from '../../modules/faturas/csv-validator';

export interface ValidateResult {
  relatorioId: string;
  valid: boolean;
  validation: ValidationResult;
  headers: string[];
  rowCount: number;
}

/**
 * Etapa 2: Valida a estrutura e dados do CSV
 * - Verifica colunas obrigatórias
 * - Valida tipos (datas, números, texto)
 * - Detecta valores nulos em campos obrigatórios
 */
export async function step2Validate(
  relatorioId: string,
  csvFilePath: string
): Promise<ValidateResult> {
  const startTime = Date.now();

  // Atualizar status para 'validando'
  await prisma.relatorio.update({
    where: { id: relatorioId },
    data: { status: 'validando' },
  });

  // Registrar início da etapa
  const historico = await prisma.historicoProcessamento.create({
    data: {
      relatorioId,
      etapa: 'validacao',
      estado: 'executando',
      iniciadoEm: new Date(),
    },
  });

  try {
    // 1. Parse do arquivo (CSV ou XLSX)
    const { headers, rows, rawRowCount } = await parseAnyFile(csvFilePath);

    // 2. Atualizar quantidade de linhas no arquivo CSV
    const relatorio = await prisma.relatorio.findUnique({
      where: { id: relatorioId },
      select: { arquivoCsvId: true },
    });

    if (relatorio?.arquivoCsvId) {
      await prisma.arquivoCsv.update({
        where: { id: relatorio.arquivoCsvId },
        data: { quantidadeLinhas: rawRowCount },
      });
    }

    // 3. Validar estrutura
    const validation = validateCsvStructure(headers, rows);
    const duration = Date.now() - startTime;

    if (validation.valid) {
      // Sucesso
      await prisma.relatorio.update({
        where: { id: relatorioId },
        data: { status: 'validado' },
      });

      await prisma.historicoProcessamento.update({
        where: { id: historico.id },
        data: {
          estado: 'sucesso',
          finalizadoEm: new Date(),
          duracaoMs: duration,
          detalhes: {
            colunas: headers.length,
            linhas: rawRowCount,
            warnings: validation.warnings.length,
          },
        },
      });
    } else {
      // Falha de validação
      await prisma.relatorio.update({
        where: { id: relatorioId },
        data: { status: 'validacao_falhou' },
      });

      await prisma.historicoProcessamento.update({
        where: { id: historico.id },
        data: {
          estado: 'falha',
          finalizadoEm: new Date(),
          duracaoMs: duration,
          detalhes: {
            errors: validation.errors.slice(0, 50), // limitar a 50 erros
            totalErrors: validation.errors.length,
          } as any,
        },
      });
    }

    return {
      relatorioId,
      valid: validation.valid,
      validation,
      headers,
      rowCount: rawRowCount,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    await prisma.relatorio.update({
      where: { id: relatorioId },
      data: { status: 'validacao_falhou' },
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
