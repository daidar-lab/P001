"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarClientes = listarClientes;
exports.buscarCliente = buscarCliente;
exports.criarCliente = criarCliente;
exports.atualizarCliente = atualizarCliente;
exports.deletarCliente = deletarCliente;
// Clientes Service — Lógica de negócio
const database_1 = __importDefault(require("../../config/database"));
async function listarClientes(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [clientes, total] = await Promise.all([
        database_1.default.cliente.findMany({
            skip,
            take: limit,
            orderBy: { criadoEm: 'desc' },
            include: {
                _count: {
                    select: { relatorios: true },
                },
            },
        }),
        database_1.default.cliente.count(),
    ]);
    return {
        data: clientes,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function buscarCliente(id) {
    return database_1.default.cliente.findUnique({
        where: { id },
        include: {
            relatorios: {
                orderBy: { criadoEm: 'desc' },
                take: 10,
                select: {
                    id: true,
                    codigoRelatorio: true,
                    titulo: true,
                    status: true,
                    periodoReferencia: true,
                    criadoEm: true,
                },
            },
            _count: {
                select: { relatorios: true },
            },
        },
    });
}
async function criarCliente(data) {
    return database_1.default.cliente.create({
        data: {
            nome: data.nome,
            cnpj: data.cnpj,
            endereco: data.endereco,
            cidade: data.cidade,
            responsavel: data.responsavel,
            emailFinanceiro: data.emailFinanceiro,
            metadataCrm: data.metadataCrm || undefined,
        },
    });
}
async function atualizarCliente(id, data) {
    return database_1.default.cliente.update({
        where: { id },
        data: {
            ...data,
            metadataCrm: data.metadataCrm || undefined,
        },
    });
}
async function deletarCliente(id) {
    return database_1.default.cliente.delete({
        where: { id },
    });
}
//# sourceMappingURL=clientes.service.js.map