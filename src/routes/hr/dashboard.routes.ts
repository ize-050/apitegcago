import { Router } from 'express';
import { HRDashboardController } from '../../controllers/hr/dashboard.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();
const controller = new HRDashboardController();

// Get monthly commission data for dashboard
router.get(
  '/monthly-commission',
  authMiddleware,
  controller.getMonthlyCommission
);

// Get commission data by type for dashboard
router.get(
  '/commission-by-type',
  authMiddleware,
  controller.getCommissionByType
);

// Get sales commission data for dashboard
router.get(
  '/sales-commission',
  authMiddleware,
  controller.getSalesCommission
);

export default router;
