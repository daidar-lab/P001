"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPipeline = runPipeline;
// Pipeline Orchestrator — Coordena a execução sequencial das etapas
const step1_ingest_1 = require("./steps/step1-ingest");
const step2_validate_1 = require("./steps/step2-validate");
const step3_process_1 = require("./steps/step3-process");
/**
 * Orquestra a execução sequencial do pipeline (etapas 1-3 na v1)
 * Cada etapa depende do sucesso da anterior.
 * Em caso de falha, o pipeline para e registra o erro.
 */
async function runPipeline(csvFilePath, originalFileName, uploadedBy) {
    const result = {
        success: false,
        stoppedAtStep: 0,
    };
    console.log(`[PIPELINE] Iniciando pipeline para "${originalFileName}"`);
    try {
        // ─── ETAPA 1: Ingestão ───
        console.log('[PIPELINE] Etapa 1: Ingestão...');
        result.ingest = await (0, step1_ingest_1.step1Ingest)(csvFilePath, originalFileName, uploadedBy);
        result.stoppedAtStep = 1;
        console.log(`[PIPELINE] Etapa 1 concluída — Relatório: ${result.ingest.codigoRelatorio}`);
        // ─── ETAPA 2: Validação ───
        console.log('[PIPELINE] Etapa 2: Validação...');
        result.validate = await (0, step2_validate_1.step2Validate)(result.ingest.relatorioId, csvFilePath);
        result.stoppedAtStep = 2;
        if (!result.validate.valid) {
            console.log(`[PIPELINE] Etapa 2 FALHOU — ${result.validate.validation.errors.length} erros encontrados`);
            result.error = `Validação falhou: ${result.validate.validation.errors.length} erros`;
            return result;
        }
        console.log(`[PIPELINE] Etapa 2 concluída — ${result.validate.rowCount} linhas válidas`);
        // ─── ETAPA 3: Processamento ───
        console.log('[PIPELINE] Etapa 3: Processamento...');
        result.process = await (0, step3_process_1.step3Process)(result.ingest.relatorioId, csvFilePath);
        result.stoppedAtStep = 3;
        console.log(`[PIPELINE] Etapa 3 concluída — ${result.process.faturasInseridas} faturas`);
        // Pipeline v1 concluído com sucesso
        result.success = true;
        console.log(`[PIPELINE] Pipeline concluído com sucesso!`);
        return result;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no pipeline';
        console.error(`[PIPELINE] ERRO na etapa ${result.stoppedAtStep + 1}: ${errorMessage}`);
        result.error = errorMessage;
        return result;
    }
}
//# sourceMappingURL=orchestrator.js.map