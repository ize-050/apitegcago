import { Router } from 'express';
import { HRDashboardController } from '../../controllers/dashboard/hr-dashboard.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();
const controller = new HRDashboardController();

// Get complete HR dashboard data
router.get(
  '/complete',
  authMiddleware,
  controller.getCompleteDashboard
);

// Get HR overview metrics
router.get(
  '/overview',
  authMiddleware,
  controller.getOverview
);

// Get monthly HR data
router.get(
  '/monthly-data',
  authMiddleware,
  controller.getMonthlyData
);

// Get commission data by type for dashboard
router.get(
  '/commission-by-type',
  authMiddleware,
  controller.getCommissionByType
);

// Get employee performance data
router.get(
  '/employee-performance',
  authMiddleware,
  controller.getEmployeePerformance
);

// Get commission status data
router.get(
  '/commission-status',
  authMiddleware,
  controller.getCommissionStatus
);

// Get revenue and commission chart data
router.get(
  '/revenue-commission-chart',
  authMiddleware,
  controller.getRevenueCommissionChart
);

export default router;
