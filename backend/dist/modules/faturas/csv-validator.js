"use strict";
// Validador de estrutura CSV — Etapa 2 do Pipeline
// Verifica se o CSV possui as colunas obrigatórias e tipos válidos
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLUMN_TYPES = exports.REQUIRED_COLUMNS = void 0;
exports.validateCsvStructure = validateCsvStructure;
// Colunas obrigatórias que devem estar presentes no CSV
exports.REQUIRED_COLUMNS = [
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
];
// Definição de tipos esperados por coluna
exports.COLUMN_TYPES = {
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
 * Valida a estrutura do CSV (colunas presentes e tipos)
 */
function validateCsvStructure(headers, rows) {
    const errors = [];
    const warnings = [];
    // Normaliza headers (trim, lowercase)
    const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
    // 1. Verificar colunas obrigatórias
    for (const col of exports.REQUIRED_COLUMNS) {
        if (!normalizedHeaders.includes(col)) {
            errors.push({
                type: 'missing_column',
                column: col,
                message: `Coluna obrigatória ausente: "${col}"`,
            });
        }
    }
    // 2. Identificar colunas extras
    for (const header of normalizedHeaders) {
        if (!exports.REQUIRED_COLUMNS.includes(header)) {
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
            for (const col of exports.REQUIRED_COLUMNS) {
                const value = row[col]?.trim();
                // Verificar campos vazios obrigatórios
                if (!value || value === '') {
                    errors.push({
                        type: 'empty_required',
                        column: col,
                        row: rowNum,
                        message: `Valor vazio na coluna obrigatória "${col}" (linha ${rowNum})`,
                    });
                    continue;
                }
                // Validar tipo
                const expectedType = exports.COLUMN_TYPES[col];
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
function isValidNumber(value) {
    // Limpa formato brasileiro
    let cleaned = value.trim();
    if (cleaned.includes(',') && cleaned.includes('.')) {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
    else if (cleaned.includes(',')) {
        cleaned = cleaned.replace(',', '.');
    }
    return !isNaN(Number(cleaned)) && cleaned !== '';
}
/**
 * Verifica se o valor é uma data válida em formatos suportados
 * Suporta: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, MM/YYYY
 */
function isValidDate(value) {
    const cleaned = value.trim();
    return (/^\d{2}\/\d{2}\/\d{4}$/.test(cleaned) ||
        /^\d{4}-\d{2}-\d{2}$/.test(cleaned) ||
        /^\d{2}-\d{2}-\d{4}$/.test(cleaned) ||
        /^\d{2}\/\d{4}$/.test(cleaned));
}
//# sourceMappingURL=csv-validator.js.map