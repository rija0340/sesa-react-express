import { Router } from 'express';
import * as kilasyLasitraController from '../controllers/kilasyLasitraController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', kilasyLasitraController.getAll);
router.post('/', kilasyLasitraController.create);
router.patch('/:id', kilasyLasitraController.update);
router.delete('/:id', kilasyLasitraController.remove);

export default router;
