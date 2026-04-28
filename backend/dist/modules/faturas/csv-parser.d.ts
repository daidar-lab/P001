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
    [key: string]: string;
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
export declare function parseCsvBuffer(buffer: Buffer): Promise<CsvParseResult>;
/**
 * Faz o parse de um arquivo CSV a partir do caminho
 */
export declare function parseCsvFile(filePath: string): Promise<CsvParseResult>;
//# sourceMappingURL=csv-parser.d.ts.map