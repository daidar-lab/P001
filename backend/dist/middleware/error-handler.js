"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.createError = createError;
exports.notFoundHandler = notFoundHandler;
function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor';
    console.error(`[ERROR] ${statusCode} - ${message}`, {
        code: err.code,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        details: err.details,
    });
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code: err.code || 'INTERNAL_ERROR',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
}
function createError(message, statusCode = 500, code, details) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    error.details = details;
    return error;
}
function notFoundHandler(_req, res) {
    res.status(404).json({
        success: false,
        error: {
            message: 'Rota não encontrada',
            code: 'NOT_FOUND',
        },
    });
}
//# sourceMappingURL=error-handler.js.map