import { Request, Response } from "express";
import SaleDashboardService from "../../services/dashboard/sale-dashboard.service";
import z from "zod";

/**
 * Sale Dashboard Controller
 * จัดการ HTTP requests สำหรับ Sale Dashboard
 * แยกออกจาก Sale Controller เดิมเพื่อความชัดเจนและไม่ชนกัน
 */

// Validation Schemas
const DashboardFiltersSchema = z.object({
  salespersonId: z.string().optional(),
  dateRange: z.enum(['week', 'month', 'quarter', 'year']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const RevenueChartFiltersSchema = DashboardFiltersSchema.extend({
  groupBy: z.enum(['day', 'week', 'month']).optional(),
});

const MonthlyAnalysisFiltersSchema = z.object({
  salespersonId: z.string().optional(),
  year: z.number().optional(),
});

const KPIFiltersSchema = z.object({
  salespersonId: z.string().optional(),
  year: z.number().optional(),
  month: z.number().optional(),
});

const ChartFiltersSchema = z.object({
  salespersonId: z.string().optional(),
  year: z.number().optional(),
});

export class SaleDashboardController {
  private saleDashboardService: SaleDashboardService;

  constructor() {
    this.saleDashboardService = new SaleDashboardService();
  }

  /**
   * GET /api/dashboard/sale/kpis
   * ดึงข้อมูล KPI Cards สำหรับ Sale Dashboard (เฉพาะของ user ที่ login)
   */
  async getSaleKPIs(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - User not found'
        });
      }

      const { year, month } = req.query;
      const filters = {
        salespersonId: userId, // ดึงข้อมูลเฉพาะของ user ที่ login
        year: year ? parseInt(year as string) : new Date().getFullYear(),
        month: month ? parseInt(month as string) : undefined
      };

      const kpiData = await this.saleDashboardService.getDashboardOverview(filters);
      
      return res.status(200).json({
        success: true,
        data: kpiData,
        message: 'Sale KPIs retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getSaleKPIs:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/dashboard/sale/overview
   * ดึงข้อมูล Dashboard Overview (KPI Cards + Trends)
   */
  async getDashboardOverview(req: Request, res: Response): Promise<any> {
    try {
      // Validate query parameters
      const validatedData = DashboardFiltersSchema.safeParse(req.query);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: validatedData.error.issues,
          statusCode: 400,
        });
      }

      const filters = validatedData.data;
      const data = await this.saleDashboardService.getDashboardOverview(filters);

      res.status(200).json({
        data,
        message: "Dashboard overview retrieved successfully",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("getDashboardOverview error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * GET /api/dashboard/sale/revenue-chart
   * ดึงข้อมูลสำหรับ Revenue Trend Chart
   */
  async getRevenueChartData(req: Request, res: Response): Promise<any> {
    try {
      // Validate query parameters
      const validatedData = RevenueChartFiltersSchema.safeParse(req.query);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: validatedData.error.issues,
          statusCode: 400,
        });
      }

      const filters = validatedData.data;
      const data = await this.saleDashboardService.getRevenueChartData(filters);

      res.status(200).json({
        data,
        message: "Revenue chart data retrieved successfully",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("getRevenueChartData error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * GET /api/dashboard/sale/job-volume-chart
   * ดึงข้อมูลสำหรับ Job Volume Chart
   */
  async getJobVolumeChartData(req: Request, res: Response): Promise<any> {
    try {
      // Validate query parameters
      const validatedData = DashboardFiltersSchema.safeParse(req.query);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: validatedData.error.issues,
          statusCode: 400,
        });
      }

      const filters = validatedData.data;
      const data = await this.saleDashboardService.getJobVolumeChartData(filters);

      res.status(200).json({
        data,
        message: "Job volume chart data retrieved successfully",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("getJobVolumeChartData error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * GET /api/dashboard/sale/monthly-analysis
   * ดึงข้อมูลสำหรับ Monthly Analysis
   */
  async getMonthlyAnalysis(req: Request, res: Response): Promise<any> {
    try {
      // Convert year to number if provided
      const queryData = {
        ...req.query,
        ...(req.query.year && { year: parseInt(req.query.year as string) }),
      };

      // Validate query parameters
      const validatedData = MonthlyAnalysisFiltersSchema.safeParse(queryData);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: validatedData.error.issues,
          statusCode: 400,
        });
      }

      const filters = validatedData.data;
      const data = await this.saleDashboardService.getMonthlyAnalysis(filters);

      res.status(200).json({
        data,
        message: "Monthly analysis data retrieved successfully",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("getMonthlyAnalysis error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * GET /api/dashboard/sale/salesperson-options
   * ดึงรายชื่อ Salesperson สำหรับ Filter Dropdown
   */
  async getSalespersonOptions(req: Request, res: Response): Promise<any> {
    try {
      const data = await this.saleDashboardService.getSalespersonOptions();

      res.status(200).json({
        data,
        message: "Salesperson options retrieved successfully",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("getSalespersonOptions error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * POST /api/dashboard/sale/export
   * Export Dashboard Data (Excel/PDF)
   */
  async exportDashboardData(req: Request, res: Response): Promise<any> {
    try {
      const ExportSchema = z.object({
        format: z.enum(['excel', 'pdf']),
        filters: DashboardFiltersSchema,
        includeCharts: z.boolean().optional().default(true),
      });

      const validatedData = ExportSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid request body",
          errors: validatedData.error.issues,
          statusCode: 400,
        });
      }

      const { format, filters, includeCharts } = validatedData.data;

      // Get all dashboard data
      const [overview, revenueChart, jobVolumeChart, monthlyAnalysis] = await Promise.all([
        this.saleDashboardService.getDashboardOverview(filters),
        this.saleDashboardService.getRevenueChartData(filters),
        this.saleDashboardService.getJobVolumeChartData(filters),
        this.saleDashboardService.getMonthlyAnalysis({
          salespersonId: filters.salespersonId,
          year: new Date().getFullYear(),
        }),
      ]);

      const exportData = {
        overview,
        charts: includeCharts ? {
          revenueChart,
          jobVolumeChart,
          monthlyAnalysis,
        } : null,
        exportedAt: new Date().toISOString(),
        filters,
      };

      // Set appropriate headers based on format
      if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=sale-dashboard-${Date.now()}.xlsx`);
      } else if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=sale-dashboard-${Date.now()}.pdf`);
      }

      // For now, return JSON data (implement actual Excel/PDF generation later)
      res.status(200).json({
        data: exportData,
        message: `Dashboard data prepared for ${format} export`,
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("exportDashboardData error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * GET /api/dashboard/sale/performance-summary/:salespersonId
   * ดึงสรุปประสิทธิภาพของ Salesperson คนหนึ่ง
   */
  async getSalespersonPerformance(req: Request, res: Response): Promise<any> {
    try {
      const salespersonId = req.params.salespersonId;
      
      if (!salespersonId) {
        return res.status(400).json({
          message: "Salesperson ID is required",
          statusCode: 400,
        });
      }

      // Validate query parameters for date range
      const validatedData = DashboardFiltersSchema.safeParse(req.query);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: validatedData.error.issues,
          statusCode: 400,
        });
      }

      const filters = { ...validatedData.data, salespersonId };

      // Get comprehensive performance data
      const [overview, revenueChart, jobVolumeChart, monthlyAnalysis] = await Promise.all([
        this.saleDashboardService.getDashboardOverview(filters),
        this.saleDashboardService.getRevenueChartData(filters),
        this.saleDashboardService.getJobVolumeChartData(filters),
        this.saleDashboardService.getMonthlyAnalysis({
          salespersonId,
          year: new Date().getFullYear(),
        }),
      ]);

      const performanceData = {
        salespersonId,
        overview,
        charts: {
          revenueChart,
          jobVolumeChart,
          monthlyAnalysis,
        },
        generatedAt: new Date().toISOString(),
      };

      res.status(200).json({
        data: performanceData,
        message: "Salesperson performance data retrieved successfully",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("getSalespersonPerformance error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * GET /api/dashboard/sale/total-contacts
   * ดึงข้อมูลจำนวนติดต่อรวม (Total Contacts)
   */
  async getTotalContactsData(req: Request, res: Response): Promise<any> {
    try {
      // Convert query parameters
      const queryData = {
        ...req.query,
        ...(req.query.year && { year: parseInt(req.query.year as string) }),
        ...(req.query.month && { month: parseInt(req.query.month as string) }),
      };

      const validatedData = KPIFiltersSchema.safeParse(queryData);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: validatedData.error.issues,
          statusCode: 400,
        });
      }

      const filters = validatedData.data;
      const data = await this.saleDashboardService.getTotalContactsData(filters);

      res.status(200).json({
        data,
        message: "Total contacts data retrieved successfully",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("getTotalContactsData error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * GET /api/dashboard/sale/pending-deals
   * ดึงข้อมูลจำนวนรอปิดการขาย (Pending Deals)
   */
  async getPendingDealsData(req: Request, res: Response): Promise<any> {
    try {
      // Convert query parameters
      const queryData = {
        ...req.query,
        ...(req.query.year && { year: parseInt(req.query.year as string) }),
        ...(req.query.month && { month: parseInt(req.query.month as string) }),
      };

      const validatedData = KPIFiltersSchema.safeParse(queryData);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: validatedData.error.issues,
          statusCode: 400,
        });
      }

      const filters = validatedData.data;
      const data = await this.saleDashboardService.getPendingDealsData(filters);

      res.status(200).json({
        data,
        message: "Pending deals data retrieved successfully",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("getPendingDealsData error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * GET /api/dashboard/sale/sales-chart
   * ดึงข้อมูลยอดขายเซลล์ (Sales Chart) รายเดือน
   */
  async getSalesChartData(req: Request, res: Response): Promise<any> {
    try {
      // Convert query parameters
      const queryData = {
        ...req.query,
        ...(req.query.year && { year: parseInt(req.query.year as string) }),
      };

      const validatedData = ChartFiltersSchema.safeParse(queryData);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: validatedData.error.issues,
          statusCode: 400,
        });
      }

      const filters = validatedData.data;
      const data = await this.saleDashboardService.getSalesChartData(filters);

      res.status(200).json({
        data,
        message: "Sales chart data retrieved successfully",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("getSalesChartData error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * GET /api/dashboard/sale/shipment-chart
   * ดึงข้อมูลยอด Shipment ของเซลล์ (Shipment Chart) รายเดือน
   */
  async getShipmentChartData(req: Request, res: Response): Promise<any> {
    try {
      // Convert query parameters
      const queryData = {
        ...req.query,
        ...(req.query.year && { year: parseInt(req.query.year as string) }),
      };

      const validatedData = ChartFiltersSchema.safeParse(queryData);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: validatedData.error.issues,
          statusCode: 400,
        });
      }

      const filters = validatedData.data;
      const data = await this.saleDashboardService.getShipmentChartData(filters);

      res.status(200).json({
        data,
        message: "Shipment chart data retrieved successfully",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("getShipmentChartData error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * GET /api/dashboard/sale/job-type-monthly-trend
   * ดึงข้อมูล Job Type Monthly Trend สำหรับ Line Chart
   */
  async getJobTypeMonthlyTrend(req: Request, res: Response): Promise<any> {
    try {
      // Convert query parameters
      const queryData = {
        ...req.query,
        ...(req.query.year && { year: parseInt(req.query.year as string) }),
      };

      const validatedData = ChartFiltersSchema.safeParse(queryData);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: validatedData.error.issues,
          statusCode: 400,
        });
      }

      const filters = validatedData.data;
      const data = await this.saleDashboardService.getJobTypeMonthlyTrend(filters);

      res.status(200).json({
        data,
        message: "Job type monthly trend data retrieved successfully",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("getJobTypeMonthlyTrend error:", err);
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
        statusCode: 500,
      });
    }
  }

  /**
   * GET /api/dashboard/sale/health-check
   * Health check endpoint for dashboard API
   */
  async healthCheck(req: Request, res: Response): Promise<any> {
    try {
      res.status(200).json({
        message: "Sale Dashboard API is healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        statusCode: 200,
      });
    } catch (err: any) {
      console.error("healthCheck error:", err);
      res.status(500).json({
        message: "Health check failed",
        error: err.message,
        statusCode: 500,
      });
    }
  }
}
