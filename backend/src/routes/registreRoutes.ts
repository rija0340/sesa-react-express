import { Router } from 'express';
import * as registreController from '../controllers/registreController.js';

const router = Router();

router.get('/', registreController.getAll);
router.get('/:id', registreController.getById);
router.post('/', registreController.create);
router.patch('/:id', registreController.update);
router.delete('/:id', registreController.remove);

export default router;
