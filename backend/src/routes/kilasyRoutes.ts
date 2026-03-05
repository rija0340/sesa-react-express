import { Router } from 'express';
import * as kilasyController from '../controllers/kilasyController.js';

const router = Router();

router.get('/', kilasyController.getAll);
router.get('/:id', kilasyController.getById);
router.post('/', kilasyController.create);
router.patch('/:id', kilasyController.update);
router.delete('/:id', kilasyController.remove);

export default router;
