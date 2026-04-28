import { Router } from 'express';
import * as equipamentosController from './equipamentos.controller';

const router = Router();

router.get('/', equipamentosController.listar);
router.post('/', equipamentosController.criar);
router.patch('/:id', equipamentosController.atualizar);
router.delete('/:id', equipamentosController.excluir);

export default router;
