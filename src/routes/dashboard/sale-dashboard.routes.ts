import express from "express";
import { SaleDashboardController } from "../../controllers/dashboard/sale-dashboard.controller";
import authMiddleware from "../../middleware/authMiddleware";

/**
 * Sale Dashboard Routes
 * จัดการ routing สำหรับ Sale Dashboard API
 * แยกออกจาก Sale Routes เดิมเพื่อความชัดเจนและไม่ชนกัน
 */

const router = express.Router();
const saleDashboardController = new SaleDashboardController();

// Apply authentication middleware to all dashboard routes


/**
 * Dashboard Overview Routes
 */

// GET /api/dashboard/sale/kpis
// ดึงข้อมูล KPI Cards สำหรับ Sale Dashboard (เฉพาะของ user ที่ login)
router.get(
  "/kpis",
  authMiddleware,
  saleDashboardController.getSaleKPIs.bind(saleDashboardController)
);

// GET /api/dashboard/sale/overview
// ดึงข้อมูล Dashboard Overview (KPI Cards + Trends)
router.get(
  "/overview",
  authMiddleware,
  saleDashboardController.getDashboardOverview.bind(saleDashboardController)
);

// GET /api/dashboard/sale/health-check
// Health check endpoint
router.get(
  "/health-check",
  authMiddleware,
  saleDashboardController.healthCheck.bind(saleDashboardController)
);

/**
 * Chart Data Routes
 */

// GET /api/dashboard/sale/revenue-chart
// ดึงข้อมูลสำหรับ Revenue Trend Chart
router.get(
  "/revenue-chart",
  authMiddleware,
  saleDashboardController.getRevenueChartData.bind(saleDashboardController)
);

// GET /api/dashboard/sale/job-volume-chart
// ดึงข้อมูลสำหรับ Job Volume Chart
router.get(
  "/job-volume-chart",
  authMiddleware,
  saleDashboardController.getJobVolumeChartData.bind(saleDashboardController)
);

// GET /api/dashboard/sale/monthly-analysis
// ดึงข้อมูลสำหรับ Monthly Analysis
router.get(
  "/monthly-analysis",
  authMiddleware,
  saleDashboardController.getMonthlyAnalysis.bind(saleDashboardController)
);

/**
 * Filter Options Routes
 */

// GET /api/dashboard/sale/salesperson-options
// ดึงรายชื่อ Salesperson สำหรับ Filter Dropdown
router.get(
  "/salesperson-options",
  authMiddleware,
  saleDashboardController.getSalespersonOptions.bind(saleDashboardController)
);

/**
 * New KPI Routes
 */

// GET /api/dashboard/sale/total-contacts
// ดึงข้อมูลจำนวนติดต่อรวม (Total Contacts)
router.get(
  "/total-contacts",
  authMiddleware,
  saleDashboardController.getTotalContactsData.bind(saleDashboardController)
);

// GET /api/dashboard/sale/pending-deals
// ดึงข้อมูลจำนวนรอปิดการขาย (Pending Deals)
router.get(
  "/pending-deals",
  authMiddleware,
  saleDashboardController.getPendingDealsData.bind(saleDashboardController)
);

// GET /api/dashboard/sale/sales-chart
// ดึงข้อมูลยอดขายเซลล์ (Sales Chart) รายเดือน
router.get(
  "/sales-chart",
  authMiddleware,
  saleDashboardController.getSalesChartData.bind(saleDashboardController)
);

// GET /api/dashboard/sale/shipment-chart
// ดึงข้อมูลยอด Shipment ของเซลล์ (Shipment Chart) รายเดือน
router.get(
  "/shipment-chart",
  authMiddleware,
  saleDashboardController.getShipmentChartData.bind(saleDashboardController)
);

// GET /api/dashboard/sale/job-type-monthly-trend
// ดึงข้อมูล Job Type Monthly Trend สำหรับ Line Chart
router.get(
  "/job-type-monthly-trend",
  authMiddleware,
  saleDashboardController.getJobTypeMonthlyTrend.bind(saleDashboardController)
);

/**
 * Export Routes
 */

// POST /api/dashboard/sale/export
// Export Dashboard Data (Excel/PDF)
router.post(
  "/export",
  authMiddleware,
  saleDashboardController.exportDashboardData.bind(saleDashboardController)
);

/**
 * Individual Performance Routes
 */

// GET /api/dashboard/sale/performance-summary/:salespersonId
// ดึงสรุปประสิทธิภาพของ Salesperson คนหนึ่ง
router.get(
  "/performance-summary/:salespersonId",
  authMiddleware,
  saleDashboardController.getSalespersonPerformance.bind(saleDashboardController)
);

/**
 * Route Documentation
 * 
 * Base URL: /api/dashboard/sale
 * 
 * Available Endpoints:
 * 
 * 1. GET /overview
 *    - Description: ดึงข้อมูล Dashboard Overview (KPI Cards + Trends)
 *    - Query Params: salespersonId?, dateRange?, startDate?, endDate?
 *    - Response: KPI data with trends
 * 
 * 2. GET /revenue-chart
 *    - Description: ดึงข้อมูลสำหรับ Revenue Trend Chart
 *    - Query Params: salespersonId?, dateRange?, startDate?, endDate?, groupBy?
 *    - Response: Chart data formatted for Chart.js
 * 
 * 3. GET /job-volume-chart
 *    - Description: ดึงข้อมูลสำหรับ Job Volume Chart
 *    - Query Params: salespersonId?, dateRange?, startDate?, endDate?
 *    - Response: Job volume data by type and salesperson
 * 
 * 4. GET /monthly-analysis
 *    - Description: ดึงข้อมูลสำหรับ Monthly Analysis
 *    - Query Params: salespersonId?, year?
 *    - Response: Monthly performance data with growth analysis
 * 
 * 5. GET /salesperson-options
 *    - Description: ดึงรายชื่อ Salesperson สำหรับ Filter
 *    - Response: List of salespersons for dropdown
 * 
 * 6. POST /export
 *    - Description: Export Dashboard Data
 *    - Body: { format: 'excel'|'pdf', filters: {...}, includeCharts?: boolean }
 *    - Response: Exported file or export data
 * 
 * 7. GET /performance-summary/:salespersonId
 *    - Description: ดึงสรุปประสิทธิภาพของ Salesperson คนหนึ่ง
 *    - Params: salespersonId
 *    - Query Params: dateRange?, startDate?, endDate?
 *    - Response: Comprehensive performance data
 * 
 * 8. GET /health-check
 *    - Description: Health check endpoint
 *    - Response: API health status
 * 
 * Authentication: All routes require valid JWT token
 * 
 * Error Responses:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (missing/invalid token)
 * - 500: Internal Server Error
 */

module.exports = router;
