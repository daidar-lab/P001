// Relatórios Routes
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as controller from './relatorios.controller';

// Configuração do Multer para uploads CSV
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '10') || 10) * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const isCsv = file.mimetype === 'text/csv' || file.originalname.endsWith('.csv');
    const isExcel = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                    file.mimetype === 'application/vnd.ms-excel' ||
                    file.originalname.endsWith('.xlsx') || 
                    file.originalname.endsWith('.xls');

    if (isCsv || isExcel) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV ou Excel são permitidos'));
    }
  },
});

const router = Router();

// Dashboard
router.get('/stats', controller.estatisticas);

// CRUD + Pipeline
router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.get('/:id/rastreabilidade', controller.rastreabilidade);
router.get('/:id/pdf', controller.downloadPdf);
router.post('/:id/gerar-pdf', controller.gerarManual);
router.post('/upload', upload.single('arquivo'), controller.upload);

export default router;
