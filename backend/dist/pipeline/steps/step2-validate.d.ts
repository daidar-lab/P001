import { ValidationResult } from '../../modules/faturas/csv-validator';
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
export declare function step2Validate(relatorioId: string, csvFilePath: string): Promise<ValidateResult>;
//# sourceMappingURL=step2-validate.d.ts.map