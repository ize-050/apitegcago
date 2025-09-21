import { Request, Response } from 'express';
import { HRDashboardService } from '../../services/dashboard/hr-dashboard.service';
import { HRFilters } from '../../repository/dashboard/hr-dashboard.repository';

export class HRDashboardController {
  private hrDashboardService: HRDashboardService;

  constructor() {
    this.hrDashboardService = new HRDashboardService();
  }

  /**
   * Get complete HR dashboard data
   */
  public  getCompleteDashboard = async (req: Request, res: Response) => {
    try {
      const filters: HRFilters = {
        year: req.query.year as string,
        month: req.query.month as string,
        employeeId: req.query.employeeId as string,
        commissionType: req.query.commissionType as string
      };

      // Validate filters
      const validation = this.hrDashboardService.validateFilters(filters);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
          errors: validation.errors
        });
      }

      const result = await this.hrDashboardService.getCompleteDashboardData(filters);
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูล HR Dashboard สำเร็จ',
        data: result.data
      });
    } catch (error: any) {
      console.error('Error fetching complete HR dashboard:', error);
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล HR Dashboard',
        error: error.message
      });
    }
  };

  /**
   * Get HR overview metrics
   */
  public  getOverview = async (req: Request, res: Response) => {
    try {
      const filters: HRFilters = {
        year: req.query.year as string,
        month: req.query.month as string
      };

      const validation = this.hrDashboardService.validateFilters(filters);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
          errors: validation.errors
        });
      }

      const result = await this.hrDashboardService.getOverviewMetrics(filters);
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลภาพรวม HR สำเร็จ',
        data: result.data
      });
    } catch (error: any) {
      console.error('Error fetching HR overview:', error);
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลภาพรวม HR',
        error: error.message
      });
    }
  };

  /**
   * Get monthly HR data
   */
  public  getMonthlyData = async (req: Request, res: Response) => {
    try {
      const filters: HRFilters = {
        year: req.query.year as string
      };

      const validation = this.hrDashboardService.validateFilters(filters);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
          errors: validation.errors
        });
      }

      const result = await this.hrDashboardService.getMonthlyData(filters);
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายเดือนสำเร็จ',
        data: result.data
      });
    } catch (error: any) {
      console.error('Error fetching monthly HR data:', error);
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายเดือน',
        error: error.message
      });
    }
  };

  /**
   * Get commission by type
   */
  public  getCommissionByType = async (req: Request, res: Response) => {
    try {
      const filters: HRFilters = {
        year: req.query.year as string,
        month: req.query.month as string
      };

      const validation = this.hrDashboardService.validateFilters(filters);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
          errors: validation.errors
        });
      }

      const result = await this.hrDashboardService.getCommissionByType(filters);
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลค่าคอมตามประเภทสำเร็จ',
        data: result.data
      });
    } catch (error: any) {
      console.error('Error fetching commission by type:', error);
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลค่าคอมตามประเภท',
        error: error.message
      });
    }
  };

  /**
   * Get employee performance
   */
  public  getEmployeePerformance = async (req: Request, res: Response) => {
    try {
      const filters: HRFilters = {
        year: req.query.year as string,
        month: req.query.month as string,
        employeeId: req.query.employeeId as string
      };

      const validation = this.hrDashboardService.validateFilters(filters);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
          errors: validation.errors
        });
      }

      const result = await this.hrDashboardService.getEmployeePerformance(filters);
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลผลงานพนักงานสำเร็จ',
        data: result.data
      });
    } catch (error: any) {
      console.error('Error fetching employee performance:', error);
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผลงานพนักงาน',
        error: error.message
      });
    }
  };

  /**
   * Get commission status
   */
  public  getCommissionStatus = async (req: Request, res: Response) => {
    try {
      const filters: HRFilters = {
        year: req.query.year as string,
        month: req.query.month as string
      };

      const validation = this.hrDashboardService.validateFilters(filters);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
          errors: validation.errors
        });
      }

      const result = await this.hrDashboardService.getCommissionStatus(filters);
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลสถานะค่าคอมสำเร็จ',
        data: result.data
      });
    } catch (error: any) {
      console.error('Error fetching commission status:', error);
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานะค่าคอม',
        error: error.message
      });
    }
  };

  /**
   * Get revenue and commission chart data
   */
  public  getRevenueCommissionChart = async (req: Request, res: Response) => {
    try {
      const filters: HRFilters = {
        year: req.query.year as string
      };

      const validation = this.hrDashboardService.validateFilters(filters);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
          errors: validation.errors
        });
      }

      const result = await this.hrDashboardService.getRevenueCommissionChart(filters);
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลกราฟรายได้และค่าคอมสำเร็จ',
        data: result.data
      });
    } catch (error: any) {
      console.error('Error fetching revenue commission chart:', error);
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกราฟรายได้และค่าคอม',
        error: error.message
      });
    }
  };
}
