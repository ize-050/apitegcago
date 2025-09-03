import { 
  HRDashboardRepository, 
  HRFilters, 
  HROverviewMetrics, 
  MonthlyHRData, 
  CommissionByType, 
  EmployeePerformance, 
  CommissionStatus 
} from '../../repository/dashboard/hr-dashboard.repository';

export class HRDashboardService {
  private hrDashboardRepository: HRDashboardRepository;

  constructor() {
    this.hrDashboardRepository = new HRDashboardRepository();
  }

  /**
   * Get complete HR dashboard data
   */
  async getCompleteDashboardData(filters: HRFilters) {
    try {
      const [
        overview,
        monthlyData,
        commissionByType,
        employeePerformance,
        commissionStatus,
        revenueCommissionChart
      ] = await Promise.all([
        this.hrDashboardRepository.getHROverviewMetrics(filters),
        this.hrDashboardRepository.getMonthlyHRData(filters),
        this.hrDashboardRepository.getCommissionByType(filters),
        this.hrDashboardRepository.getEmployeePerformance(filters),
        this.hrDashboardRepository.getCommissionStatus(filters),
        this.hrDashboardRepository.getRevenueCommissionChart(filters)
      ]);

      return {
        success: true,
        data: {
          overview,
          monthlyData,
          commissionByType,
          employeePerformance,
          commissionStatus,
          revenueCommissionChart
        }
      };
    } catch (error: any) {
      console.error('Error fetching complete HR dashboard data:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล HR Dashboard',
        error: error.message
      };
    }
  }

  /**
   * Get HR overview metrics
   */
  async getOverviewMetrics(filters: HRFilters): Promise<{ success: boolean; data?: HROverviewMetrics; message?: string; error?: string }> {
    try {
      const data = await this.hrDashboardRepository.getHROverviewMetrics(filters);
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error fetching HR overview metrics:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลภาพรวม HR',
        error: error.message
      };
    }
  }

  /**
   * Get monthly HR data
   */
  async getMonthlyData(filters: HRFilters): Promise<{ success: boolean; data?: MonthlyHRData[]; message?: string; error?: string }> {
    try {
      const data = await this.hrDashboardRepository.getMonthlyHRData(filters);
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error fetching monthly HR data:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายเดือน',
        error: error.message
      };
    }
  }

  /**
   * Get commission by type
   */
  async getCommissionByType(filters: HRFilters): Promise<{ success: boolean; data?: CommissionByType[]; message?: string; error?: string }> {
    try {
      const data = await this.hrDashboardRepository.getCommissionByType(filters);
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error fetching commission by type:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลค่าคอมตามประเภท',
        error: error.message
      };
    }
  }

  /**
   * Get employee performance
   */
  async getEmployeePerformance(filters: HRFilters): Promise<{ success: boolean; data?: EmployeePerformance[]; message?: string; error?: string }> {
    try {
      const data = await this.hrDashboardRepository.getEmployeePerformance(filters);
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error fetching employee performance:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผลงานพนักงาน',
        error: error.message
      };
    }
  }

  /**
   * Get commission status
   */
  async getCommissionStatus(filters: HRFilters): Promise<{ 
    success: boolean; 
    data?: { statusSummary: { pending: number; paid: number; saved: number }; details: CommissionStatus[] }; 
    message?: string; 
    error?: string 
  }> {
    try {
      const data = await this.hrDashboardRepository.getCommissionStatus(filters);
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error fetching commission status:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานะค่าคอม',
        error: error.message
      };
    }
  }

  /**
   * Get revenue and commission chart data
   */
  async getRevenueCommissionChart(filters: HRFilters): Promise<{ 
    success: boolean; 
    data?: Array<{ id: string; color: string; data: Array<{ x: string; y: number }> }>; 
    message?: string; 
    error?: string 
  }> {
    try {
      const data = await this.hrDashboardRepository.getRevenueCommissionChart(filters);
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error fetching revenue commission chart:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกราฟรายได้และค่าคอม',
        error: error.message
      };
    }
  }

  /**
   * Validate filters
   */
  validateFilters(filters: HRFilters): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate year
    if (filters.year) {
      const year = parseInt(filters.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 2020 || year > currentYear + 1) {
        errors.push('ปีต้องอยู่ระหว่าง 2020 ถึงปีหน้า');
      }
    }

    // Validate month
    if (filters.month) {
      const month = parseInt(filters.month);
      if (isNaN(month) || month < 1 || month > 12) {
        errors.push('เดือนต้องอยู่ระหว่าง 1-12');
      }
    }

    // Validate employeeId (UUID format)
    if (filters.employeeId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(filters.employeeId)) {
        errors.push('รูปแบบ Employee ID ไม่ถูกต้อง');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
