import { Router } from 'express';
import * as statsController from '../controllers/statsController.js';

const router = Router();

router.get('/summary', statsController.getSummary);
router.get('/kilasy/:id', statsController.getStatsKilasy);
router.get('/kilasy/:id/periode', statsController.getStatsKilasyPeriode);

export default router;
