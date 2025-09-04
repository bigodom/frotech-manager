import { Router } from 'express';
import { getMaintenanceMonthlyTotals, getFuelMonthlyTotals } from '../controllers/dashboardController.js';

const router = Router();

router.get('/dashboard/maintenance', getMaintenanceMonthlyTotals);
router.get('/dashboard/fuel', getFuelMonthlyTotals);

export default router;
