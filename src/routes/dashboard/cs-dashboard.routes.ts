import express from "express";
import { CSDashboardController } from "../../controllers/dashboard/cs-dashboard.controller";
import authMiddleware from "../../middleware/authMiddleware";

/**
 * CS Dashboard Routes
 * จัดการ routing สำหรับ CS Dashboard API
 * รองรับการแสดงผล KPIs, การวิเคราะห์ shipment, port, product type และ status tracking
 */

const router = express.Router();
const csDashboardController = new CSDashboardController();

/**
 * Dashboard Overview Routes
 */

// GET /api/dashboard/cs/overview
// ดึงข้อมูล CS Dashboard Overview (KPIs + basic charts)
router.get(
  "/overview",
  authMiddleware,
  csDashboardController.getDashboardOverview.bind(csDashboardController)
);

// GET /api/dashboard/cs/complete
// ดึงข้อมูล CS Dashboard แบบครบถ้วน (ทุก components)
router.get(
  "/complete",
  authMiddleware,
  csDashboardController.getCompleteDashboard.bind(csDashboardController)
);

/**
 * KPI Routes
 */

// GET /api/dashboard/cs/kpis
// ดึงข้อมูล CS KPIs (new requests, quotations, proposals, accepted jobs)
router.get(
  "/kpis",
  authMiddleware,
  csDashboardController.getCSKPIs.bind(csDashboardController)
);

/**
 * Analysis Routes
 */

// GET /api/dashboard/cs/shipment-analysis
// ดึงข้อมูลการวิเคราะห์ shipment (route, transport, term, group work, job type)
router.get(
  "/shipment-analysis",
  authMiddleware,
  csDashboardController.getShipmentAnalysis.bind(csDashboardController)
);

// GET /api/dashboard/cs/port-analysis
// ดึงข้อมูลการวิเคราะห์ port (origin, destination)
router.get(
  "/port-analysis",
  authMiddleware,
  csDashboardController.getPortAnalysis.bind(csDashboardController)
);

// GET /api/dashboard/cs/product-type-analysis
// ดึงข้อมูลการวิเคราะห์ product type
router.get(
  "/product-type-analysis",
  authMiddleware,
  csDashboardController.getProductTypeAnalysis.bind(csDashboardController)
);

/**
 * Status Tracking Routes
 */

// GET /api/dashboard/cs/status-tracking
// ดึงข้อมูล CS status tracking (container, document, departure, delivery)
router.get(
  "/status-tracking",
  authMiddleware,
  csDashboardController.getCSStatusTracking.bind(csDashboardController)
);

/**
 * Filter Options Routes
 */

// GET /api/dashboard/cs/filters
// ดึงตัวเลือกสำหรับ filters (transport, route, term)
router.get(
  "/filters",
  authMiddleware,
  csDashboardController.getAvailableFilters.bind(csDashboardController)
);

/**
 * Route Documentation
 * 
 * Base URL: /api/dashboard/cs
 * 
 * Available Endpoints:
 * 
 * 1. GET /overview
 *    - Description: ดึงข้อมูล CS Dashboard Overview (KPIs + basic charts)
 *    - Query Params: startDate?, endDate?, transport?, route?, term?
 *    - Response: KPIs, basic shipment analysis, และ available filters
 * 
 * 2. GET /complete
 *    - Description: ดึงข้อมูล CS Dashboard แบบครบถ้วน
 *    - Query Params: startDate?, endDate?, transport?, route?, term?
 *    - Response: ข้อมูลทั้งหมดของ CS Dashboard
 * 
 * 3. GET /kpis
 *    - Description: ดึงข้อมูล CS KPIs
 *    - Query Params: startDate?, endDate?, transport?, route?, term?
 *    - Response: { newRequests, quotations, proposals, acceptedJobs }
 * 
 * 4. GET /shipment-analysis
 *    - Description: ดึงข้อมูลการวิเคราะห์ shipment
 *    - Query Params: startDate?, endDate?, transport?, route?, term?
 *    - Response: { route, transport, term, groupWork, jobType }
 * 
 * 5. GET /port-analysis
 *    - Description: ดึงข้อมูลการวิเคราะห์ port
 *    - Query Params: startDate?, endDate?, transport?, route?, term?
 *    - Response: { origin, destination }
 * 
 * 6. GET /product-type-analysis
 *    - Description: ดึงข้อมูลการวิเคราะห์ product type
 *    - Query Params: startDate?, endDate?, transport?, route?, term?
 *    - Response: { productTypes }
 * 
 * 7. GET /status-tracking
 *    - Description: ดึงข้อมูล CS status tracking
 *    - Query Params: startDate?, endDate?, transport?, route?, term?
 *    - Response: { containerStatus, documentStatus, departureStatus, deliveryStatus }
 * 
 * 8. GET /filters
 *    - Description: ดึงตัวเลือกสำหรับ filters
 *    - Response: { transports, routes, terms }
 * 
 * Query Parameters:
 * - startDate: วันที่เริ่มต้น (YYYY-MM-DD format)
 * - endDate: วันที่สิ้นสุด (YYYY-MM-DD format)
 * - transport: ประเภทการขนส่ง
 * - route: เส้นทาง
 * - term: เงื่อนไขการขนส่ง
 * 
 * Authentication: All routes require valid JWT token
 * 
 * Error Responses:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (missing/invalid token)
 * - 500: Internal Server Error
 */

export default router;
