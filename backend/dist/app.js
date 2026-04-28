"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Audit Energy — Backend Server
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Carregar variáveis de ambiente
dotenv_1.default.config();
const logger_1 = require("./middleware/logger");
const error_handler_1 = require("./middleware/error-handler");
// Rotas
const clientes_routes_1 = __importDefault(require("./modules/clientes/clientes.routes"));
const relatorios_routes_1 = __importDefault(require("./modules/relatorios/relatorios.routes"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
// ─── Middleware Global ───
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_1.requestLogger);
// ─── Garantir diretórios de upload e output ───
const fs_1 = __importDefault(require("fs"));
const uploadsDir = path_1.default.join(__dirname, '../uploads');
const outputDir = path_1.default.join(__dirname, '../output');
if (!fs_1.default.existsSync(uploadsDir))
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
if (!fs_1.default.existsSync(outputDir))
    fs_1.default.mkdirSync(outputDir, { recursive: true });
// ─── Rotas da API ───
app.use('/api/clientes', clientes_routes_1.default);
app.use('/api/relatorios', relatorios_routes_1.default);
// ─── Health Check ───
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'Audit Energy Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// ─── 404 e Error Handler ───
app.use(error_handler_1.notFoundHandler);
app.use(error_handler_1.errorHandler);
// ─── Iniciar Servidor ───
app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════╗');
    console.log('  ║    ⚡ Audit Energy Backend v1.0      ║');
    console.log(`  ║    🌐 http://localhost:${PORT}          ║`);
    console.log(`  ║    📂 Env: ${process.env.NODE_ENV || 'development'}            ║`);
    console.log('  ╚══════════════════════════════════════╝');
    console.log('');
});
exports.default = app;
//# sourceMappingURL=app.js.map