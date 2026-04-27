// Parser CSV — Converte linhas CSV em objetos tipados
import { parse } from 'csv-parse';
import { Readable } from 'stream';

export interface ParsedCsvRow {
  periodo_referencia: string;
  cliente_nome: string;
  numero_unidade: string;
  concessionaria: string;
  periodo_medicao_inicio: string;
  periodo_medicao_fim: string;
  classe_tarifaria: string;
  data_emissao: string;
  valor_total: string;
  consumo_kwh: string;
  valor_cip: string;
  bandeira_tarifaria: string;
  consumo_kwh_mes_anterior: string;
  [key: string]: string; // permite colunas extras
}

export interface CsvParseResult {
  headers: string[];
  rows: ParsedCsvRow[];
  rawRowCount: number;
}

/**
 * Faz o parse de um buffer CSV e retorna headers + linhas tipadas
 * Suporta delimitadores ; e , (auto-detecta)
 */
export async function parseCsvBuffer(buffer: Buffer): Promise<CsvParseResult> {
  const content = buffer.toString('utf-8');

  // Auto-detecta delimitador (;  ou ,)
  const firstLine = content.split('\n')[0] || '';
  const delimiter = firstLine.includes(';') ? ';' : ',';

  return new Promise((resolve, reject) => {
    const rows: ParsedCsvRow[] = [];
    let headers: string[] = [];

    const stream = Readable.from(content);

    stream
      .pipe(
        parse({
          delimiter,
          columns: (rawHeaders: string[]) => {
            headers = rawHeaders.map((h: string) => h.trim().toLowerCase());
            return headers;
          },
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
          bom: true, // Handle BOM (UTF-8 with BOM from Excel)
        })
      )
      .on('data', (row: ParsedCsvRow) => {
        rows.push(row);
      })
      .on('end', () => {
        resolve({
          headers,
          rows,
          rawRowCount: rows.length,
        });
      })
      .on('error', (error: Error) => {
        reject(new Error(`Erro ao processar CSV: ${error.message}`));
      });
  });
}

/**
 * Faz o parse de um arquivo CSV a partir do caminho
 */
export async function parseCsvFile(filePath: string): Promise<CsvParseResult> {
  const fs = await import('fs');
  const buffer = fs.readFileSync(filePath);
  return parseCsvBuffer(buffer);
}
