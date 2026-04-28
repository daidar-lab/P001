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
export declare function step1Ingest(filePath: string, originalName: string, uploadedBy?: string): Promise<IngestResult>;
//# sourceMappingURL=step1-ingest.d.ts.map