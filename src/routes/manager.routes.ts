import express from 'express';
import { ManagerDashboardController } from '../controllers/manager/manager-dashboard.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = express.Router();
const managerDashboardController = new ManagerDashboardController();

// Apply authentication and manager role middleware to all routes
router.use(authMiddleware);
// router.use(roleMiddleware(['Manager', 'Finance', 'Sale', 'CS', 'HR']));

// Manager Dashboard Routes
router.get('/dashboard/sale', managerDashboardController.getSaleDashboardData.bind(managerDashboardController));
router.get('/dashboard/sale/shipment-chart', managerDashboardController.getShipmentChartData.bind(managerDashboardController));
router.get('/dashboard/sale/sales-chart', managerDashboardController.getSalesChartData.bind(managerDashboardController));
router.get('/dashboard/sale/salesperson-options', managerDashboardController.getSalespersonOptions.bind(managerDashboardController));
router.get('/dashboard/sale/salespersons', managerDashboardController.getAllSalespersons.bind(managerDashboardController));
router.get('/dashboard/cs', managerDashboardController.getCSDashboardData.bind(managerDashboardController));
router.get('/dashboard/account', managerDashboardController.getAccountDashboardData.bind(managerDashboardController));
router.get('/dashboard/hr', managerDashboardController.getHRDashboardData.bind(managerDashboardController));

module.exports = router;
