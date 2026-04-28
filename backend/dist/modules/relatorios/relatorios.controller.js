"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listar = listar;
exports.buscar = buscar;
exports.upload = upload;
exports.rastreabilidade = rastreabilidade;
exports.estatisticas = estatisticas;
const relatoriosService = __importStar(require("./relatorios.service"));
const orchestrator_1 = require("../../pipeline/orchestrator");
const error_handler_1 = require("../../middleware/error-handler");
async function listar(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const clienteId = req.query.clienteId;
        const result = await relatoriosService.listarRelatorios(page, limit, status, clienteId);
        res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
}
async function buscar(req, res, next) {
    try {
        const { id } = req.params;
        const relatorio = await relatoriosService.buscarRelatorio(id);
        if (!relatorio) {
            throw (0, error_handler_1.createError)('Relatório não encontrado', 404, 'RELATORIO_NOT_FOUND');
        }
        res.json({ success: true, data: relatorio });
    }
    catch (error) {
        next(error);
    }
}
async function upload(req, res, next) {
    try {
        if (!req.file) {
            throw (0, error_handler_1.createError)('Arquivo CSV é obrigatório', 400, 'MISSING_FILE');
        }
        const { originalname, path: filePath } = req.file;
        const uploadedBy = req.body.uploadedBy || 'sistema';
        console.log(`[UPLOAD] Recebido: ${originalname} → Iniciando pipeline...`);
        const result = await (0, orchestrator_1.runPipeline)(filePath, originalname, uploadedBy);
        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'CSV processado com sucesso',
                data: {
                    codigoRelatorio: result.ingest?.codigoRelatorio,
                    relatorioId: result.ingest?.relatorioId,
                    faturasProcessadas: result.process?.faturasInseridas,
                    camposRastreados: result.process?.camposRastreados,
                },
            });
        }
        else {
            res.status(422).json({
                success: false,
                message: 'Pipeline parou com erros',
                error: result.error,
                stoppedAtStep: result.stoppedAtStep,
                validation: result.validate?.validation,
            });
        }
    }
    catch (error) {
        next(error);
    }
}
async function rastreabilidade(req, res, next) {
    try {
        const { id } = req.params;
        const campos = await relatoriosService.buscarRastreabilidade(id);
        res.json({ success: true, data: campos });
    }
    catch (error) {
        next(error);
    }
}
async function estatisticas(_req, res, next) {
    try {
        const stats = await relatoriosService.obterEstatisticas();
        res.json({ success: true, data: stats });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=relatorios.controller.js.map