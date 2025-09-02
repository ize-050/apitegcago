import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface HRFilters {
  year?: string;
  month?: string;
  employeeId?: string;
  commissionType?: string;
}

export interface HROverviewMetrics {
  totalCommission: number;
  salesCount: number;
  shipmentCount: number;
  averageCommissionPerEmployee: number;
  pendingCommissions: number;
  paidCommissions: number;
}

export interface MonthlyHRData {
  month: string;
  totalCommission: number;
  shipmentCount: number;
  revenue: number;
}

export interface CommissionByType {
  type: string;
  commission: number;
  shipmentCount: number;
  percentage: number;
}

export interface EmployeePerformance {
  employeeId: string;
  name: string;
  shipments: number;
  commission: number;
  revenue: number;
  commissionRate: number;
}

export interface CommissionStatus {
  status: string;
  count: number;
  totalAmount: number;
}

export class HRDashboardRepository {
  /**
   * Get HR overview metrics
   */
  async getHROverviewMetrics(filters: HRFilters): Promise<HROverviewMetrics> {
    const dateFilter = this.buildDateFilter(filters);
    
    // Get total commission and counts
    let query = `
      SELECT 
        COALESCE(SUM(ec.commission_amount), 0) as total_commission,
        COUNT(DISTINCT ec.employee_id) as sales_count,
        COUNT(DISTINCT ec.d_purchase_id) as shipment_count,
        SUM(CASE WHEN ec.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN ec.status = 'paid' THEN 1 ELSE 0 END) as paid_count
      FROM employee_commissions ec
      JOIN d_purchase d ON ec.d_purchase_id = d.id
      WHERE d.deletedAt IS NULL`;
    
    const params: any[] = [];
    if (filters.year && filters.month) {
      query += ` AND DATE_FORMAT(d.createdAt, '%Y-%m') = ?`;
      params.push(`${filters.year}-${filters.month.padStart(2, '0')}`);
    } else if (filters.year) {
      query += ` AND YEAR(d.createdAt) = ?`;
      params.push(parseInt(filters.year));
    }
    
    const commissionData = await prisma.$queryRawUnsafe<Array<{
      total_commission: number;
      sales_count: number;
      shipment_count: number;
      pending_count: number;
      paid_count: number;
    }>>(query, ...params);

    const data = commissionData[0] || {
      total_commission: 0,
      sales_count: 0,
      shipment_count: 0,
      pending_count: 0,
      paid_count: 0
    };

    return {
      totalCommission: Number(data.total_commission),
      salesCount: Number(data.sales_count),
      shipmentCount: Number(data.shipment_count),
      averageCommissionPerEmployee: data.sales_count > 0 ? 
        Number(data.total_commission) / Number(data.sales_count) : 0,
      pendingCommissions: Number(data.pending_count),
      paidCommissions: Number(data.paid_count)
    };
  }

  /**
   * Get monthly HR data
   */
  async getMonthlyHRData(filters: HRFilters): Promise<MonthlyHRData[]> {
    let query = `
      SELECT 
        DATE_FORMAT(d.createdAt, '%Y-%m') as month,
        COALESCE(SUM(ec.commission_amount), 0) as total_commission,
        COUNT(DISTINCT d.id) as shipment_count,
        COALESCE(SUM(pf.billing_amount), 0) as revenue
      FROM d_purchase d
      LEFT JOIN employee_commissions ec ON ec.d_purchase_id = d.id
      LEFT JOIN purchase_finance pf ON pf.d_purchase_id = d.id
      WHERE d.deletedAt IS NULL`;
    
    const params: any[] = [];
    if (filters.year) {
      query += ` AND YEAR(d.createdAt) = ?`;
      params.push(parseInt(filters.year));
    } else {
      query += ` AND YEAR(d.createdAt) = YEAR(CURDATE())`;
    }
    
    query += `
      GROUP BY DATE_FORMAT(d.createdAt, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12`;

    const monthlyData = await prisma.$queryRawUnsafe<Array<{
      month: string;
      total_commission: number;
      shipment_count: number;
      revenue: number;
    }>>(query, ...params);

    return monthlyData.map(item => ({
      month: item.month,
      totalCommission: Number(item.total_commission),
      shipmentCount: Number(item.shipment_count),
      revenue: Number(item.revenue)
    }));
  }

  /**
   * Get commission by type
   */
  async getCommissionByType(filters: HRFilters): Promise<CommissionByType[]> {
    const dateFilter = this.buildDateFilter(filters);
    
    let query = `
      SELECT 
        d.d_term as type,
        COALESCE(SUM(ec.commission_amount), 0) as commission,
        COUNT(DISTINCT d.id) as shipment_count
      FROM d_purchase d
      LEFT JOIN employee_commissions ec ON ec.d_purchase_id = d.id
      WHERE d.deletedAt IS NULL
        AND d.d_term IS NOT NULL`;
    
    const params: any[] = [];
    if (filters.year && filters.month) {
      query += ` AND DATE_FORMAT(d.createdAt, '%Y-%m') = ?`;
      params.push(`${filters.year}-${filters.month.padStart(2, '0')}`);
    } else if (filters.year) {
      query += ` AND YEAR(d.createdAt) = ?`;
      params.push(parseInt(filters.year));
    }
    
    query += `
      GROUP BY d.d_term
      HAVING commission > 0
      ORDER BY commission DESC`;
    
    const commissionByType = await prisma.$queryRawUnsafe<Array<{
      type: string;
      commission: number;
      shipment_count: number;
    }>>(query, ...params);

    const totalCommission = commissionByType.reduce((sum, item) => sum + Number(item.commission), 0);

    return commissionByType.map(item => ({
      type: item.type,
      commission: Number(item.commission),
      shipmentCount: Number(item.shipment_count),
      percentage: totalCommission > 0 ? (Number(item.commission) / totalCommission) * 100 : 0
    }));
  }

  /**
   * Get employee performance
   */
  async getEmployeePerformance(filters: HRFilters): Promise<EmployeePerformance[]> {
    const dateFilter = this.buildDateFilter(filters);
    
    let query = `
      SELECT 
        u.id as employee_id,
        u.fullname,
        COUNT(DISTINCT d.id) as shipments,
        COALESCE(SUM(ec.commission_amount), 0) as commission,
        COALESCE(SUM(pf.billing_amount), 0) as revenue
      FROM user u
      JOIN employee_commissions ec ON ec.employee_id = u.id
      JOIN d_purchase d ON ec.d_purchase_id = d.id
      LEFT JOIN purchase_finance pf ON pf.d_purchase_id = d.id
      WHERE u.deletedAt IS NULL
        AND d.deletedAt IS NULL`;
    
    const params: any[] = [];
    if (filters.year && filters.month) {
      query += ` AND DATE_FORMAT(d.createdAt, '%Y-%m') = ?`;
      params.push(`${filters.year}-${filters.month.padStart(2, '0')}`);
    } else if (filters.year) {
      query += ` AND YEAR(d.createdAt) = ?`;
      params.push(parseInt(filters.year));
    }
    
    if (filters.employeeId) {
      query += ` AND u.id = ?`;
      params.push(filters.employeeId);
    }
    
    query += `
      GROUP BY u.id, u.fullname
      HAVING commission > 0
      ORDER BY commission DESC`;
    
    const employeePerformance = await prisma.$queryRawUnsafe<Array<{
      employee_id: string;
      fullname: string;
      shipments: number;
      commission: number;
      revenue: number;
    }>>(query, ...params);

    return employeePerformance.map(item => ({
      employeeId: item.employee_id,
      name: item.fullname,
      shipments: Number(item.shipments),
      commission: Number(item.commission),
      revenue: Number(item.revenue),
      commissionRate: item.revenue > 0 ? (Number(item.commission) / Number(item.revenue)) * 100 : 0
    }));
  }

  /**
   * Get commission status summary
   */
  async getCommissionStatus(filters: HRFilters): Promise<{
    statusSummary: { pending: number; paid: number; saved: number };
    details: CommissionStatus[];
  }> {
    const dateFilter = this.buildDateFilter(filters);
    
    let query = `
      SELECT 
        ec.status,
        COUNT(*) as count,
        COALESCE(SUM(ec.commission_amount), 0) as total_amount
      FROM employee_commissions ec
      JOIN d_purchase d ON ec.d_purchase_id = d.id
      WHERE d.deletedAt IS NULL`;
    
    const params: any[] = [];
    if (filters.year && filters.month) {
      query += ` AND DATE_FORMAT(d.createdAt, '%Y-%m') = ?`;
      params.push(`${filters.year}-${filters.month.padStart(2, '0')}`);
    } else if (filters.year) {
      query += ` AND YEAR(d.createdAt) = ?`;
      params.push(parseInt(filters.year));
    }
    
    query += `
      GROUP BY ec.status
      ORDER BY 
        CASE ec.status 
          WHEN 'pending' THEN 1 
          WHEN 'paid' THEN 2 
          WHEN 'saved' THEN 3 
          ELSE 4 
        END`;
    
    const statusData = await prisma.$queryRawUnsafe<Array<{
      status: string;
      count: number;
      total_amount: number;
    }>>(query, ...params);

    const statusSummary = {
      pending: 0,
      paid: 0,
      saved: 0
    };

    const details: CommissionStatus[] = statusData.map(item => {
      const status = item.status as keyof typeof statusSummary;
      if (status in statusSummary) {
        statusSummary[status] = Number(item.count);
      }
      
      return {
        status: item.status,
        count: Number(item.count),
        totalAmount: Number(item.total_amount)
      };
    });

    return { statusSummary, details };
  }

  /**
   * Build date filter for queries (deprecated - use inline filtering instead)
   */
  private buildDateFilter(filters: HRFilters) {
    // This method is deprecated in favor of inline parameter binding
    return null;
  }

  /**
   * Get revenue and commission chart data
   */
  async getRevenueCommissionChart(filters: HRFilters): Promise<Array<{
    id: string;
    color: string;
    data: Array<{ x: string; y: number }>;
  }>> {
    const monthlyData = await this.getMonthlyHRData(filters);
    
    return [
      {
        id: 'รายได้',
        color: 'hsl(210, 70%, 50%)',
        data: monthlyData.map(item => ({
          x: this.formatMonthDisplay(item.month),
          y: item.revenue
        }))
      },
      {
        id: 'ค่าคอมมิชชั่น',
        color: 'hsl(120, 70%, 50%)',
        data: monthlyData.map(item => ({
          x: this.formatMonthDisplay(item.month),
          y: item.totalCommission
        }))
      }
    ];
  }

  /**
   * Format month for display (2025-01 -> ม.ค. 25)
   */
  private formatMonthDisplay(month: string): string {
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    
    const monthIndex = parseInt(monthNum) - 1;
    const shortYear = year.slice(-2);
    
    return `${monthNames[monthIndex]} ${shortYear}`;
  }
}
