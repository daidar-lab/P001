import { IngestResult } from './steps/step1-ingest';
import { ValidateResult } from './steps/step2-validate';
import { ProcessResult } from './steps/step3-process';
export interface PipelineResult {
    success: boolean;
    stoppedAtStep: number;
    ingest?: IngestResult;
    validate?: ValidateResult;
    process?: ProcessResult;
    error?: string;
}
/**
 * Orquestra a execução sequencial do pipeline (etapas 1-3 na v1)
 * Cada etapa depende do sucesso da anterior.
 * Em caso de falha, o pipeline para e registra o erro.
 */
export declare function runPipeline(csvFilePath: string, originalFileName: string, uploadedBy?: string): Promise<PipelineResult>;
//# sourceMappingURL=orchestrator.d.ts.map