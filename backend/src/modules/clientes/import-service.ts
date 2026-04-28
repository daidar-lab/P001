import * as XLSX from 'xlsx';
import prisma from '../../config/database';
import { sanitizeScientificNotation } from '../../utils/string-utils';

export interface ImportResult {
  sucesso: number;
  falhas: number;
  erros: string[];
}

/**
 * Processa importação de clientes a partir de um arquivo (Buffer)
 * Suporta Excel (.xlsx, .xls) e CSV
 */
export async function importarClientes(fileBuffer: Buffer): Promise<ImportResult> {
  const result: ImportResult = {
    sucesso: 0,
    falhas: 0,
    erros: [],
  };

  try {
    // Ler o arquivo usando XLSX (suporta CSV e Excel)
    console.log('Iniciando leitura do buffer de importação...', { size: fileBuffer.length });
    
    let workbook;
    try {
      workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true, codepage: 65001 });
    } catch (readError) {
      console.error('Erro crítico ao ler buffer com XLSX:', readError);
      throw new Error('O arquivo enviado não é um Excel ou CSV válido.');
    }

    const firstSheetName = workbook.SheetNames[0];
    console.log('Planilhas encontradas:', workbook.SheetNames);
    
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Converter para JSON
    const rows = XLSX.utils.sheet_to_json(worksheet) as any[];
    console.log(`Leitura concluída. Linhas encontradas: ${rows.length}`);

    if (rows.length > 0) {
      console.log('Colunas detectadas:', Object.keys(rows[0]));
    }

    // Função auxiliar para buscar valor de coluna ignorando espaços extras e case
    const getRowValue = (row: any, ...keys: string[]) => {
      const rowKeys = Object.keys(row);
      for (const key of keys) {
        const foundKey = rowKeys.find(k => k.trim().toLowerCase() === key.toLowerCase());
        if (foundKey) return row[foundKey];
      }
      return null;
    };

    for (const row of rows) {
      try {
        // Mapeamento flexível de colunas
        const rawCnpj = getRowValue(row, 'CPF/CNPJ', 'CNPJ', 'CPF', 'Documento') || '';
        const cnpj = sanitizeScientificNotation(String(rawCnpj))?.replace(/\D/g, ''); 

        if (!cnpj) {
          result.falhas++;
          result.erros.push(`Linha ${rows.indexOf(row) + 1} ignorada: Coluna CPF/CNPJ não encontrada ou vazia.`);
          continue;
        }

        const nome = sanitizeScientificNotation(getRowValue(row, 'Nome da UC', 'Nome', 'Cliente')) || 'Cliente Sem Nome';
        const emailFinanceiro = sanitizeScientificNotation(getRowValue(row, 'E-mail', 'Email', 'Financeiro'));
        const cidade = sanitizeScientificNotation(getRowValue(row, 'Cidade', 'Municipio'));
        
        const logradouro = sanitizeScientificNotation(getRowValue(row, 'Logradouro', 'Rua', 'Endereço')) || '';
        const numero = sanitizeScientificNotation(getRowValue(row, 'Número', 'Nº', 'Num')) || '';
        const endereco = `${logradouro}${numero ? ', ' + numero : ''}`.trim() || null;

        // Metadados extras
        const metadataCrm = {
          numeroUC: sanitizeScientificNotation(getRowValue(row, 'Número da UC', 'UC', 'Instalação')),
          distribuidora: sanitizeScientificNotation(getRowValue(row, 'Distribuidora', 'Concessionária')),
          subgrupo: sanitizeScientificNotation(getRowValue(row, 'Subgrupo', 'Grupo')),
          cep: sanitizeScientificNotation(getRowValue(row, 'CEP')),
          estado: sanitizeScientificNotation(getRowValue(row, 'Estado', 'UF')),
          importadoEm: new Date().toISOString()
        };

        // Upsert: Cria se não existir, atualiza se já existir (baseado no CNPJ)
        await prisma.cliente.upsert({
          where: { cnpj },
          update: {
            nome,
            endereco,
            cidade,
            emailFinanceiro,
            metadataCrm: metadataCrm as any,
          },
          create: {
            nome,
            cnpj,
            endereco,
            cidade,
            emailFinanceiro,
            metadataCrm: metadataCrm as any,
          },
        });

        result.sucesso++;
      } catch (err) {
        result.falhas++;
        result.erros.push(`Erro ao processar cliente: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
    }

    return result;
  } catch (error) {
    throw new Error(`Falha ao ler arquivo de importação: ${error instanceof Error ? error.message : 'Erro no formato do arquivo'}`);
  }
}
