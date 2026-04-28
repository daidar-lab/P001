"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.step2Validate = step2Validate;
// Pipeline Etapa 2 — Validação
// Validação estrutural e de tipos do CSV
const database_1 = __importDefault(require("../../config/database"));
const csv_parser_1 = require("../../modules/faturas/csv-parser");
const csv_validator_1 = require("../../modules/faturas/csv-validator");
/**
 * Etapa 2: Valida a estrutura e dados do CSV
 * - Verifica colunas obrigatórias
 * - Valida tipos (datas, números, texto)
 * - Detecta valores nulos em campos obrigatórios
 */
async function step2Validate(relatorioId, csvFilePath) {
    const startTime = Date.now();
    // Atualizar status para 'validando'
    await database_1.default.relatorio.update({
        where: { id: relatorioId },
        data: { status: 'validando' },
    });
    // Registrar início da etapa
    const historico = await database_1.default.historicoProcessamento.create({
        data: {
            relatorioId,
            etapa: 'validacao',
            estado: 'executando',
            iniciadoEm: new Date(),
        },
    });
    try {
        // 1. Parse do CSV
        const { headers, rows, rawRowCount } = await (0, csv_parser_1.parseCsvFile)(csvFilePath);
        // 2. Atualizar quantidade de linhas no arquivo CSV
        const relatorio = await database_1.default.relatorio.findUnique({
            where: { id: relatorioId },
            select: { arquivoCsvId: true },
        });
        if (relatorio?.arquivoCsvId) {
            await database_1.default.arquivoCsv.update({
                where: { id: relatorio.arquivoCsvId },
                data: { quantidadeLinhas: rawRowCount },
            });
        }
        // 3. Validar estrutura
        const validation = (0, csv_validator_1.validateCsvStructure)(headers, rows);
        const duration = Date.now() - startTime;
        if (validation.valid) {
            // Sucesso
            await database_1.default.relatorio.update({
                where: { id: relatorioId },
                data: { status: 'validado' },
            });
            await database_1.default.historicoProcessamento.update({
                where: { id: historico.id },
                data: {
                    estado: 'sucesso',
                    finalizadoEm: new Date(),
                    duracaoMs: duration,
                    detalhes: {
                        colunas: headers.length,
                        linhas: rawRowCount,
                        warnings: validation.warnings.length,
                    },
                },
            });
        }
        else {
            // Falha de validação
            await database_1.default.relatorio.update({
                where: { id: relatorioId },
                data: { status: 'validacao_falhou' },
            });
            await database_1.default.historicoProcessamento.update({
                where: { id: historico.id },
                data: {
                    estado: 'falha',
                    finalizadoEm: new Date(),
                    duracaoMs: duration,
                    detalhes: {
                        errors: validation.errors.slice(0, 50), // limitar a 50 erros
                        totalErrors: validation.errors.length,
                    },
                },
            });
        }
        return {
            relatorioId,
            valid: validation.valid,
            validation,
            headers,
            rowCount: rawRowCount,
        };
    }
    catch (error) {
        const duration = Date.now() - startTime;
        await database_1.default.relatorio.update({
            where: { id: relatorioId },
            data: { status: 'validacao_falhou' },
        });
        await database_1.default.historicoProcessamento.update({
            where: { id: historico.id },
            data: {
                estado: 'falha',
                finalizadoEm: new Date(),
                duracaoMs: duration,
                detalhes: {
                    error: error instanceof Error ? error.message : 'Erro desconhecido',
                },
            },
        });
        throw error;
    }
}
//# sourceMappingURL=step2-validate.js.map