// Validador de estrutura CSV — Etapa 2 do Pipeline
// Verifica se o CSV possui as colunas obrigatórias e tipos válidos

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  columnCount: number;
  rowCount: number;
}

export interface ValidationError {
  type: 'missing_column' | 'invalid_type' | 'empty_required' | 'invalid_format';
  column?: string;
  row?: number;
  message: string;
}

export interface ValidationWarning {
  type: 'extra_column' | 'empty_optional';
  column?: string;
  row?: number;
  message: string;
}

// Mapeamento de sinônimos para colunas do CSV (flexibilidade para PowerHub e outros formatos)
export const COLUMN_MAPPING: Record<string, string[]> = {
  periodo_referencia: ['referencia', 'ref', 'mês/ano', 'periodo', 'periodo_referencia'],
  cliente_nome: ['cliente', 'razão social', 'nome', 'cliente_nome', 'razao social'],
  numero_unidade: ['número da unidade', 'uc', 'unidade consumidora', 'unidade', 'numero_unidade', 'numero da unidade'],
  concessionaria: ['concessionária', 'distribuidora', 'empresa', 'concessionaria'],
  periodo_medicao_inicio: ['início medição', 'data inicial', 'medicao inicio', 'periodo_medicao_inicio', 'inicio medicao'],
  periodo_medicao_fim: ['fim medição', 'data final', 'medicao fim', 'periodo_medicao_fim', 'fim medicao'],
  classe_tarifaria: ['classe', 'classe tarifária', 'tipo', 'classe_tarifaria', 'classe tarifaria'],
  data_emissao: ['emissão', 'data emissão', 'data_emissao', 'emissao', 'data emissao'],
  valor_total: ['total', 'valor total', 'valor da fatura', 'valor_total', 'valor total'],
  consumo_kwh: ['kwh', 'consumo kwh', 'consumo', 'consumo_kwh', 'consumo kwh'],
  valor_cip: ['cip', 'iluminação pública', 'cosip', 'valor_cip', 'iluminacao publica'],
  bandeira_tarifaria: ['bandeira', 'bandeira tarifária', 'bandeira_tarifaria', 'bandeira tarifaria'],
  consumo_kwh_mes_anterior: ['anterior kwh', 'consumo anterior', 'consumo mes anterior', 'consumo_kwh_mes_anterior'],
};

// Definição de tipos esperados por coluna
export const COLUMN_TYPES: Record<string, 'date' | 'number' | 'text'> = {
  periodo_referencia: 'date',
  cliente_nome: 'text',
  numero_unidade: 'text',
  concessionaria: 'text',
  periodo_medicao_inicio: 'date',
  periodo_medicao_fim: 'date',
  classe_tarifaria: 'text',
  data_emissao: 'date',
  valor_total: 'number',
  consumo_kwh: 'number',
  valor_cip: 'number',
  bandeira_tarifaria: 'text',
  consumo_kwh_mes_anterior: 'number',
};

/**
 * Busca o valor de uma coluna usando mapeamento flexível
 */
export function getMappedValue(row: Record<string, string>, internalKey: string): string | undefined {
  const synonyms = COLUMN_MAPPING[internalKey] || [internalKey];
  
  // Tentar cada sinônimo
  for (const synonym of synonyms) {
    // Busca exata (case-insensitive)
    const key = Object.keys(row).find(k => k.toLowerCase().trim() === synonym.toLowerCase().trim());
    if (key && row[key] !== undefined) {
      return row[key];
    }
  }
  return undefined;
}

// Colunas obrigatórias internas (usadas como chaves no sistema)
export const REQUIRED_COLUMNS = [
  'periodo_referencia',
  'cliente_nome',
  'numero_unidade',
  'concessionaria',
  'periodo_medicao_inicio',
  'periodo_medicao_fim',
  'classe_tarifaria',
  'data_emissao',
  'valor_total',
  'consumo_kwh',
  'valor_cip',
  'bandeira_tarifaria',
  'consumo_kwh_mes_anterior',
] as const;

/**
 * Valida a estrutura do CSV (colunas presentes e tipos)
 */
export function validateCsvStructure(
  headers: string[],
  rows: Record<string, string>[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Normaliza headers (trim, lowercase)
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());

  // 1. Verificar colunas obrigatórias usando o mapeamento
  for (const internalKey of REQUIRED_COLUMNS) {
    const synonyms = COLUMN_MAPPING[internalKey] || [internalKey];
    const found = synonyms.some(syn => normalizedHeaders.includes(syn.toLowerCase().trim()));
    
    if (!found) {
      errors.push({
        type: 'missing_column',
        column: internalKey,
        message: `Coluna obrigatória ausente: "${internalKey}" (não encontramos nenhum sinônimo como "${synonyms[0]}")`,
      });
    }
  }

  // 2. Identificar colunas extras
  for (const header of normalizedHeaders) {
    const isMapped = Object.values(COLUMN_MAPPING).some(syns => syns.includes(header));
    if (!isMapped) {
      warnings.push({
        type: 'extra_column',
        column: header,
        message: `Coluna extra encontrada (será ignorada): "${header}"`,
      });
    }
  }

  // 3. Validar tipos por linha (se não há erros de coluna)
  if (errors.length === 0) {
    rows.forEach((row, index) => {
      const rowNum = index + 2; // +1 header, +1 base-0

      for (const col of REQUIRED_COLUMNS) {
        // Usar mapeamento flexível para pegar o valor
        const value = getMappedValue(row, col)?.trim();

        // Verificar campos vazios obrigatórios
        if (!value || value === '') {
          errors.push({
            type: 'empty_required',
            column: col,
            row: rowNum,
            message: `Valor vazio na coluna "${col}" (mapeada no arquivo) (linha ${rowNum})`,
          });
          continue;
        }

        // Validar tipo
        const expectedType = COLUMN_TYPES[col];
        if (expectedType === 'number' && !isValidNumber(value)) {
          errors.push({
            type: 'invalid_type',
            column: col,
            row: rowNum,
            message: `Valor não numérico "${value}" na coluna "${col}" (linha ${rowNum})`,
          });
        }

        if (expectedType === 'date' && !isValidDate(value)) {
          errors.push({
            type: 'invalid_format',
            column: col,
            row: rowNum,
            message: `Formato de data inválido "${value}" na coluna "${col}" (linha ${rowNum})`,
          });
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    columnCount: headers.length,
    rowCount: rows.length,
  };
}

/**
 * Verifica se o valor é um número válido (suporta formato BR: 1.234,56)
 */
function isValidNumber(value: string): boolean {
  // Limpa formato brasileiro
  let cleaned = value.trim();
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }
  return !isNaN(Number(cleaned)) && cleaned !== '';
}

/**
 * Verifica se o valor é uma data válida em formatos suportados
 * Suporta: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, MM/YYYY
 */
function isValidDate(value: string): boolean {
  const cleaned = value.trim();
  return (
    /^\d{2}\/\d{2}\/\d{4}$/.test(cleaned) ||
    /^\d{4}-\d{2}-\d{2}$/.test(cleaned) ||
    /^\d{2}-\d{2}-\d{4}$/.test(cleaned) ||
    /^\d{2}\/\d{4}$/.test(cleaned)
  );
}
