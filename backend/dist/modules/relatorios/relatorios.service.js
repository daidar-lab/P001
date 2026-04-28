"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarRelatorios = listarRelatorios;
exports.buscarRelatorio = buscarRelatorio;
exports.buscarRastreabilidade = buscarRastreabilidade;
exports.obterEstatisticas = obterEstatisticas;
// Relatórios Service — Lógica de negócio
const database_1 = __importDefault(require("../../config/database"));
async function listarRelatorios(page = 1, limit = 20, status, clienteId) {
    const skip = (page - 1) * limit;
    const where = {};
    if (status)
        where.status = status;
    if (clienteId)
        where.clienteId = clienteId;
    const [relatorios, total] = await Promise.all([
        database_1.default.relatorio.findMany({
            where,
            skip,
            take: limit,
            orderBy: { criadoEm: 'desc' },
            include: {
                cliente: {
                    select: { id: true, nome: true, cnpj: true },
                },
                arquivoCsv: {
                    select: { id: true, nomeArquivo: true, quantidadeLinhas: true },
                },
                _count: {
                    select: { faturas: true },
                },
            },
        }),
        database_1.default.relatorio.count({ where }),
    ]);
    return {
        data: relatorios,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function buscarRelatorio(id) {
    return database_1.default.relatorio.findUnique({
        where: { id },
        include: {
            cliente: true,
            arquivoCsv: true,
            template: true,
            faturas: {
                orderBy: { numeroLinha: 'asc' },
            },
            historicoProcessamento: {
                orderBy: { criadoEm: 'asc' },
            },
            statusFluxoTrabalho: {
                orderBy: { etapa: 'asc' },
            },
            analisesIa: true,
            _count: {
                select: {
                    faturas: true,
                    rastreabilidadeCampos: true,
                },
            },
        },
    });
}
async function buscarRastreabilidade(relatorioId) {
    return database_1.default.rastreabilidadeCampo.findMany({
        where: { relatorioId },
        orderBy: { criadoEm: 'asc' },
    });
}
async function obterEstatisticas() {
    const [totalRelatorios, porStatus, ultimosRelatorios] = await Promise.all([
        database_1.default.relatorio.count(),
        database_1.default.relatorio.groupBy({
            by: ['status'],
            _count: { id: true },
        }),
        database_1.default.relatorio.findMany({
            take: 5,
            orderBy: { criadoEm: 'desc' },
            select: {
                id: true,
                codigoRelatorio: true,
                titulo: true,
                status: true,
                criadoEm: true,
                cliente: {
                    select: { nome: true },
                },
            },
        }),
    ]);
    return {
        totalRelatorios,
        porStatus: porStatus.reduce((acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
        }, {}),
        ultimosRelatorios,
    };
}
//# sourceMappingURL=relatorios.service.js.map