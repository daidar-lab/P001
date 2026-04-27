// Pipeline Etapa 1 — Ingestão
// Upload do CSV, cálculo de checksum, registro no banco
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import prisma from '../../config/database';
import { gerarCodigoRelatorio } from '../../utils/calculations';

export interface IngestResult {
  relatorioId: string;
  arquivoCsvId: string;
  codigoRelatorio: string;
  checksum: string;
  nomeArquivo: string;
}

/**
 * Etapa 1: Ingere o arquivo CSV no sistema
 * - Calcula checksum SHA-256
 * - Registra em arquivos_csv
 * - Cria registro em relatórios com status 'carregado'
 */
export async function step1Ingest(
  filePath: string,
  originalName: string,
  uploadedBy?: string
): Promise<IngestResult> {
  // 1. Ler arquivo e calcular checksum
  const fileBuffer = fs.readFileSync(filePath);
  const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  // 2. Gerar chave de armazenamento única
  const timestamp = Date.now();
  const ext = path.extname(originalName);
  const chaveArmazenamento = `csv/${timestamp}-${checksum.substring(0, 8)}${ext}`;

  // 3. Gerar código do relatório
  const codigoRelatorio = gerarCodigoRelatorio();

  // 4. Registrar no banco (transação)
  const result = await prisma.$transaction(async (tx) => {
    // Criar registro do arquivo CSV
    const arquivoCsv = await tx.arquivoCsv.create({
      data: {
        nomeArquivo: originalName,
        chaveArmazenamento,
        checksum,
        tipoConteudo: 'text/csv',
        carregadoPor: uploadedBy || 'sistema',
        metadados: {
          tamanhoBytes: fileBuffer.length,
          caminhoLocal: filePath,
        },
      },
    });

    // Criar registro do relatório
    const relatorio = await tx.relatorio.create({
      data: {
        codigoRelatorio,
        titulo: `Relatório ${originalName}`,
        arquivoCsvId: arquivoCsv.id,
        status: 'carregado',
        criadoPor: uploadedBy || 'sistema',
      },
    });

    // Registrar no histórico de processamento
    await tx.historicoProcessamento.create({
      data: {
        relatorioId: relatorio.id,
        etapa: 'ingestao',
        estado: 'sucesso',
        iniciadoEm: new Date(),
        finalizadoEm: new Date(),
        detalhes: {
          nomeArquivo: originalName,
          checksum,
          tamanhoBytes: fileBuffer.length,
        },
        tentadoPor: uploadedBy || 'sistema',
      },
    });

    // Log de auditoria
    await tx.logAuditoria.create({
      data: {
        tipoObjeto: 'relatorio',
        idObjeto: relatorio.id,
        acao: 'criado',
        usuario: uploadedBy || 'sistema',
        mensagem: `Relatório ${codigoRelatorio} criado a partir do CSV "${originalName}"`,
        metadados: { checksum },
      },
    });

    return {
      relatorioId: relatorio.id,
      arquivoCsvId: arquivoCsv.id,
      codigoRelatorio,
      checksum,
      nomeArquivo: originalName,
    };
  });

  return result;
}
