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
export declare const REQUIRED_COLUMNS: readonly ["periodo_referencia", "cliente_nome", "numero_unidade", "concessionaria", "periodo_medicao_inicio", "periodo_medicao_fim", "classe_tarifaria", "data_emissao", "valor_total", "consumo_kwh", "valor_cip", "bandeira_tarifaria", "consumo_kwh_mes_anterior"];
export declare const COLUMN_TYPES: Record<string, 'date' | 'number' | 'text'>;
/**
 * Valida a estrutura do CSV (colunas presentes e tipos)
 */
export declare function validateCsvStructure(headers: string[], rows: Record<string, string>[]): ValidationResult;
//# sourceMappingURL=csv-validator.d.ts.map