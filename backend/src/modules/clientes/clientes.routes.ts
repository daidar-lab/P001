import { Router } from 'express';
import multer from 'multer';
import * as controller from './clientes.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);
router.post('/importar', upload.single('arquivo'), controller.importar);

export default router;
