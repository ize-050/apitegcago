import { Request, Response } from 'express';
import { CSDashboardService, CSFilters } from '../../services/dashboard/cs-dashboard.service';

export class CSDashboardController {
  private service: CSDashboardService;

  constructor() {
    this.service = new CSDashboardService();
  }

  /**
   * Get CS Dashboard KPIs
   * GET /api/dashboard/cs/kpis
   */
  async getCSKPIs(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.extractFilters(req);
      const kpis = await this.service.getCSKPIs(filters);

      res.status(200).json({
        success: true,
        data: kpis,
        message: 'CS KPIs retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getCSKPIs:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get Shipment Analysis Data
   * GET /api/dashboard/cs/shipment-analysis
   */
  async getShipmentAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.extractFilters(req);
      const shipmentAnalysis = await this.service.getShipmentAnalysis(filters);

      res.status(200).json({
        success: true,
        data: shipmentAnalysis,
        message: 'Shipment analysis retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getShipmentAnalysis:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get Port Analysis Data
   * GET /api/dashboard/cs/port-analysis
   */
  async getPortAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.extractFilters(req);
      const portAnalysis = await this.service.getPortAnalysis(filters);

      res.status(200).json({
        success: true,
        data: portAnalysis,
        message: 'Port analysis retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getPortAnalysis:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get Product Type Analysis Data
   * GET /api/dashboard/cs/product-type-analysis
   */
  async getProductTypeAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.extractFilters(req);
      const productTypeAnalysis = await this.service.getProductTypeAnalysis(filters);

      res.status(200).json({
        success: true,
        data: productTypeAnalysis,
        message: 'Product type analysis retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getProductTypeAnalysis:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get CS Status Tracking Data
   * GET /api/dashboard/cs/status-tracking
   */
  async getCSStatusTracking(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.extractFilters(req);
      const statusTracking = await this.service.getCSStatusTracking(filters);

      res.status(200).json({
        success: true,
        data: statusTracking,
        message: 'CS status tracking retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getCSStatusTracking:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get Available Filters
   * GET /api/dashboard/cs/filters
   */
  async getAvailableFilters(req: Request, res: Response): Promise<void> {
    try {
      const filters = await this.service.getAvailableFilters();

      res.status(200).json({
        success: true,
        data: filters,
        message: 'Available filters retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getAvailableFilters:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get Complete CS Dashboard Data
   * GET /api/dashboard/cs/complete
   */
  async getCompleteDashboard(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.extractFilters(req);
      const dashboardData = await this.service.getDashboardData(filters);

      res.status(200).json({
        success: true,
        data: dashboardData,
        message: 'Complete CS dashboard data retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getCompleteDashboard:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get CS Dashboard Overview (KPIs + basic charts)
   * GET /api/dashboard/cs/overview
   */
  async getDashboardOverview(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.extractFilters(req);
      
      const [kpis, shipmentAnalysis, availableFilters] = await Promise.all([
        this.service.getCSKPIs(filters),
        this.service.getShipmentAnalysis(filters),
        this.service.getAvailableFilters()
      ]);

      const overviewData = {
        kpis,
        shipmentAnalysis: {
          transport: shipmentAnalysis.transport,
          jobType: shipmentAnalysis.jobType
        },
        availableFilters,
        appliedFilters: filters
      };

      res.status(200).json({
        success: true,
        data: overviewData,
        message: 'CS dashboard overview retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Extract filters from request query parameters
   */
  private extractFilters(req: Request): CSFilters {
    const { startDate, endDate, transport, route, term } = req.query;

    const filters: CSFilters = {};

    if (startDate && typeof startDate === 'string') {
      filters.startDate = startDate;
    }

    if (endDate && typeof endDate === 'string') {
      filters.endDate = endDate;
    }

    if (transport && typeof transport === 'string') {
      filters.transport = transport;
    }

    if (route && typeof route === 'string') {
      filters.route = route;
    }

    if (term && typeof term === 'string') {
      filters.term = term;
    }

    return filters;
  }

  /**
   * Validate request parameters
   */
  private validateFilters(filters: CSFilters): string[] {
    const errors: string[] = [];

    // Validate date format
    if (filters.startDate && !this.isValidDate(filters.startDate)) {
      errors.push('Invalid start date format. Use YYYY-MM-DD');
    }

    if (filters.endDate && !this.isValidDate(filters.endDate)) {
      errors.push('Invalid end date format. Use YYYY-MM-DD');
    }

    // Validate date range
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      if (startDate > endDate) {
        errors.push('Start date cannot be after end date');
      }
    }

    return errors;
  }

  /**
   * Check if date string is valid
   */
  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}
