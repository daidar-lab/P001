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
export declare function step3Process(relatorioId: string, csvFilePath: string): Promise<ProcessResult>;
//# sourceMappingURL=step3-process.d.ts.map