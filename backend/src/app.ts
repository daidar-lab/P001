// Audit Energy — Backend Server
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

// Rotas
import clientesRoutes from './modules/clientes/clientes.routes';
import relatoriosRoutes from './modules/relatorios/relatorios.routes';
import equipamentosRoutes from './modules/equipamentos/equipamentos.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ─── Middleware Global ───
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Garantir diretórios de upload e output ───
import fs from 'fs';
const uploadsDir = path.join(__dirname, '../uploads');
const outputDir = path.join(__dirname, '../output');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// ─── Rotas da API ───
app.use('/api/clientes', clientesRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/equipamentos', equipamentosRoutes);

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
app.use(notFoundHandler);
app.use(errorHandler);

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

export default app;
