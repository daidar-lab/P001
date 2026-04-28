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
exports.criar = criar;
exports.atualizar = atualizar;
exports.deletar = deletar;
const clientesService = __importStar(require("./clientes.service"));
const error_handler_1 = require("../../middleware/error-handler");
async function listar(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await clientesService.listarClientes(page, limit);
        res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
}
async function buscar(req, res, next) {
    try {
        const { id } = req.params;
        const cliente = await clientesService.buscarCliente(id);
        if (!cliente) {
            throw (0, error_handler_1.createError)('Cliente não encontrado', 404, 'CLIENTE_NOT_FOUND');
        }
        res.json({ success: true, data: cliente });
    }
    catch (error) {
        next(error);
    }
}
async function criar(req, res, next) {
    try {
        const { nome, cnpj, endereco, cidade, responsavel, emailFinanceiro, metadataCrm } = req.body;
        if (!nome || !cnpj) {
            throw (0, error_handler_1.createError)('Nome e CNPJ são obrigatórios', 400, 'VALIDATION_ERROR');
        }
        const cliente = await clientesService.criarCliente({
            nome,
            cnpj,
            endereco,
            cidade,
            responsavel,
            emailFinanceiro,
            metadataCrm,
        });
        res.status(201).json({ success: true, data: cliente });
    }
    catch (error) {
        next(error);
    }
}
async function atualizar(req, res, next) {
    try {
        const { id } = req.params;
        const cliente = await clientesService.atualizarCliente(id, req.body);
        res.json({ success: true, data: cliente });
    }
    catch (error) {
        next(error);
    }
}
async function deletar(req, res, next) {
    try {
        const { id } = req.params;
        await clientesService.deletarCliente(id);
        res.json({ success: true, message: 'Cliente deletado com sucesso' });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=clientes.controller.js.map