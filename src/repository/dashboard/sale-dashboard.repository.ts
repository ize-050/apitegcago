import { prisma } from "../../prisma/prisma-client";
import moment from "moment";

/**
 * Sale Dashboard Repository
 * จัดการข้อมูลสำหรับ Sale Dashboard โดยเฉพาะ
 * แยกออกจาก Sale Repository เดิมเพื่อความชัดเจนและไม่ชนกัน
 */
class SaleDashboardRepository {
  constructor() {
    // ใช้ prisma singleton
  }

  /**
   * 1. ดึงข้อมูล KPI Cards
   * - Total Contacts (จำนวนลูกค้าทั้งหมด)
   * - Pending Deals (งานที่รอปิดการขาย)
   * - Total Revenue (รายได้รวม)
   * - Total Shipments (จำนวนงานรวม)
   */
  async getDashboardKPIs(filters: {
    salespersonId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      const { salespersonId, startDate, endDate } = filters;

      // Base where condition
      const baseWhere: any = {
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      };

      // Salesperson filter
      const salespersonFilter = salespersonId && salespersonId !== 'all' 
        ? { customer_emp: { some: { user_id: salespersonId } } }
        : {};

      const purchaseFilter = salespersonId && salespersonId !== 'all'
        ? { d_purchase_emp: { some: { user_id: salespersonId } } }
        : {};

      // 1. Total Contacts
      const totalContacts = await prisma.customer.count({
        where: {
          ...baseWhere,
          ...salespersonFilter,
        },
      });

      // 2. Pending Deals (ทุกสถานะยกเว้น "ปิดการขาย" และ "ยกเลิกคำสั่งซื้อ")
      const pendingDeals = await prisma.d_purchase.count({
        where: {
          ...baseWhere,
          ...purchaseFilter,
          d_status: {
            notIn: ["ปิดการขาย", "ยกเลิกคำสั่งซื้อ"],
          },
        },
      });

      // 3. Total Revenue (รวมยอดขาย) - Using raw SQL to avoid Prisma type issues
      const revenueQuery = `
        SELECT COALESCE(SUM(CAST(pf.total_after_vat AS DECIMAL(15,2))), 0) as total_revenue
        FROM d_purchase dp
        LEFT JOIN d_purchase_emp dpe ON dp.id = dpe.d_purchase_id
        LEFT JOIN user u ON dpe.user_id = u.id
        LEFT JOIN purchase_finance pf ON dp.id = pf.d_purchase_id
        WHERE dp.d_status IN ('ปิดการขาย', 'Financial', 'อยู่ระหว่างทำ Financial')
          AND pf.total_after_vat IS NOT NULL
          ${salespersonId && salespersonId !== 'all' ? `AND u.id = '${salespersonId}'` : ''}
          ${startDate && endDate ? `AND dp.createdAt BETWEEN '${startDate}' AND '${endDate}'` : ''}
      `;
      const revenueResult = await prisma.$queryRawUnsafe(revenueQuery);

      // 4. Total Shipments (จำนวนงานที่ปิดการขายแล้ว)
      const totalShipments = await prisma.d_purchase.count({
        where: {
          ...baseWhere,
          ...purchaseFilter,
          d_status: {
            in: ["ปิดการขาย", "Financial", "อยู่ระหว่างทำ Financial"],
          },
        },
      });

      return {
        totalContacts,
        pendingDeals,
        totalRevenue: Number((revenueResult as any)[0]?.total_revenue) || 0,
        totalShipments,
      };
    } catch (err: any) {
      throw new Error(`getDashboardKPIs error: ${err.message}`);
    }
  }

  /**
   * 2. ดึงข้อมูลรายได้แยกตามประเภทงาน (สำหรับ Revenue Trend Chart)
   */
  async getRevenueByJobType(filters: {
    salespersonId?: string;
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'month' | 'week' | 'day';
  }): Promise<any> {
    try {
      const { salespersonId, startDate, endDate, groupBy = 'month' } = filters;

      // Date format based on groupBy
      const dateFormat = {
        month: '%Y-%m',
        week: '%Y-%u',
        day: '%Y-%m-%d',
      }[groupBy];

      const purchaseFilter = salespersonId && salespersonId !== 'all'
        ? { d_purchase_emp: { some: { user_id: salespersonId } } }
        : {};

      const baseWhere: any = {
        ...purchaseFilter,
        d_status: {
          in: ["ปิดการขาย", "Financial", "อยู่ระหว่างทำ Financial"],
        },
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      };

      // Raw SQL query for better performance with grouping
      const sqlQuery = `
        SELECT 
          DATE_FORMAT(dp.createdAt, '${dateFormat}') as period,
          dp.d_route,
          dp.d_transport,
          dp.d_term,
          SUM(COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0)) as total_revenue,
          COUNT(*) as job_count
        FROM d_purchase dp
        LEFT JOIN d_purchase_emp dpe ON dp.id = dpe.d_purchase_id
        LEFT JOIN purchase_finance pf ON dp.id = pf.d_purchase_id
        WHERE dp.d_status IN ('ปิดการขาย', 'Financial', 'อยู่ระหว่างทำ Financial')
          AND pf.total_after_vat IS NOT NULL 
          AND CAST(pf.total_after_vat AS DECIMAL(10,2)) > 0
          ${salespersonId && salespersonId !== 'all' ? `AND dpe.user_id = '${salespersonId}'` : ''}
          ${startDate && endDate ? `AND dp.createdAt BETWEEN '${moment(startDate).format('YYYY-MM-DD')}' AND '${moment(endDate).format('YYYY-MM-DD')}'` : ''}
        GROUP BY period, dp.d_route, dp.d_transport, dp.d_term
        ORDER BY period DESC, total_revenue DESC
      `;
      const revenueByType = await prisma.$queryRawUnsafe(sqlQuery);

      return revenueByType;
    } catch (err: any) {
      throw new Error(`getRevenueByJobType error: ${err.message}`);
    }
  }

  /**
   * 3. ดึงจำนวนงานแยกตามประเภท (สำหรับ Job Volume Chart)
   */
  async getJobVolumeByType(filters: {
    salespersonId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      const { salespersonId, startDate, endDate } = filters;

      const purchaseFilter = salespersonId && salespersonId !== 'all'
        ? { d_purchase_emp: { some: { user_id: salespersonId } } }
        : {};

      const baseWhere: any = {
        ...purchaseFilter,
        d_status: {
          in: ["ปิดการขาย", "Financial", "อยู่ระหว่างทำ Financial"],
        },
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      };

      // Get job volume by complete job type combinations
      const jobVolumeQuery = `
        SELECT 
          u.name as sale_name,
          u.id as sale_id,
          COUNT(*) as total_jobs,
          -- สร้าง Job Type Combination (รวม 5 มิติเป็น 1 ประเภทงาน)
          CONCAT(
            COALESCE(dp.d_route, ''), '-',
            COALESCE(dp.d_transport, ''), '-', 
            COALESCE(dp.d_term, ''), '-',
            COALESCE(dp.t_group_work, ''), '-',
            COALESCE(dp.d_group_work, '')
          ) as job_type_combination,
          -- นับจำนวนงานแต่ละประเภทงานแบบรวม
          COUNT(*) as job_count,
          -- แยกตาม Route (สำหรับ high-level view)
          SUM(CASE WHEN dp.d_route = 'import' THEN 1 ELSE 0 END) as import_jobs,
          SUM(CASE WHEN dp.d_route = 'export' THEN 1 ELSE 0 END) as export_jobs,
          -- แยกตาม Transport (สำหรับ high-level view)
          SUM(CASE WHEN dp.d_transport = 'SEA' THEN 1 ELSE 0 END) as sea_jobs,
          SUM(CASE WHEN dp.d_transport = 'AIR' THEN 1 ELSE 0 END) as air_jobs,
          SUM(CASE WHEN dp.d_transport = 'EK' THEN 1 ELSE 0 END) as ek_jobs,
          SUM(CASE WHEN dp.d_transport = 'RE' THEN 1 ELSE 0 END) as re_jobs,
          -- แยกตาม Term (สำหรับ high-level view)
          SUM(CASE WHEN dp.d_term = 'ALL IN' THEN 1 ELSE 0 END) as all_in_jobs,
          SUM(CASE WHEN dp.d_term = 'CIF' THEN 1 ELSE 0 END) as cif_jobs,
          SUM(CASE WHEN dp.d_term = 'FOB' THEN 1 ELSE 0 END) as fob_jobs,
          SUM(CASE WHEN dp.d_term = 'EXW' THEN 1 ELSE 0 END) as exw_jobs
        FROM d_purchase dp
        JOIN d_purchase_emp dpe ON dp.id = dpe.d_purchase_id
        JOIN user u ON dpe.user_id = u.id
        WHERE dp.d_status IN ('ปิดการขาย', 'Financial', 'อยู่ระหว่างทำ Financial')
          ${salespersonId && salespersonId !== 'all' ? `AND u.id = '${salespersonId}'` : ''}
          ${startDate && endDate ? `AND dp.createdAt BETWEEN '${moment(startDate).format('YYYY-MM-DD')}' AND '${moment(endDate).format('YYYY-MM-DD')}'` : ''}
        GROUP BY u.id, u.name, job_type_combination
        ORDER BY u.name, job_count DESC
      `;
      const jobVolumeData = await prisma.$queryRawUnsafe(jobVolumeQuery);

      return jobVolumeData;
    } catch (err: any) {
      throw new Error(`getJobVolumeByType error: ${err.message}`);
    }
  }

  /**
   * 4. ดึงข้อมูลแนวโน้มรายเดือนสำหรับแต่ละ Job Type Combination
   */
  async getJobTypeMonthlyTrend(filters: {
    salespersonId?: string;
    year?: number;
  }): Promise<any> {
    try {
      const { salespersonId, year = new Date().getFullYear() } = filters;

      const monthlyTrendQuery = `
        SELECT 
          -- สร้าง Job Type Combination (รวม 5 มิติเป็น 1 ประเภทงาน)
          CONCAT(
            COALESCE(dp.d_route, ''), '-',
            COALESCE(dp.d_transport, ''), '-', 
            COALESCE(dp.d_term, ''), '-',
            COALESCE(dp.t_group_work, ''), '-',
            COALESCE(dp.d_group_work, '')
          ) as job_type_combination,
          -- แยกตามเดือน (มค-ธค)
          MONTH(dp.createdAt) as month_number,
          MONTHNAME(dp.createdAt) as month_name,
          -- นับจำนวนงานในแต่ละเดือน
          COUNT(*) as job_count,
          -- ข้อมูลเพิ่มเติม
          SUM(COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0)) as total_revenue,
          AVG(COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0)) as avg_job_value,
          u.fullname as sale_name,
          u.id as sale_id
        FROM d_purchase dp
        JOIN d_purchase_emp dpe ON dp.id = dpe.d_purchase_id
        JOIN user u ON dpe.user_id = u.id
        LEFT JOIN purchase_finance pf ON dp.id = pf.d_purchase_id
        WHERE dp.d_status IN ('ปิดการขาย', 'Financial', 'อยู่ระหว่างทำ Financial')
          AND YEAR(dp.createdAt) = ${year}
          ${salespersonId && salespersonId !== 'all' ? `AND u.id = '${salespersonId}'` : ''}
        GROUP BY job_type_combination, MONTH(dp.createdAt), MONTHNAME(dp.createdAt), u.id, u.fullname
        ORDER BY u.fullname, month_number, job_count DESC
      `;
      const monthlyTrendData = await prisma.$queryRawUnsafe(monthlyTrendQuery);

      return monthlyTrendData;
    } catch (err: any) {
      throw new Error(`getJobTypeMonthlyTrend error: ${err.message}`);
    }
  }

  /**
   * 5. ดึงข้อมูลการวิเคราะห์รายเดือน (สำหรับ Monthly Analysis)
   */
  async getMonthlyAnalysis(filters: {
    salespersonId?: string;
    year?: number;
  }): Promise<any> {
    try {
      const { salespersonId, year = new Date().getFullYear() } = filters;

      const monthlyQuery = `
        SELECT 
          u.fullname as sale_name,
          u.id as sale_id,
          DATE_FORMAT(dp.createdAt, '%Y-%m') as month_period,
          DATE_FORMAT(dp.createdAt, '%Y') as year_period,
          COUNT(*) as jobs_count,
          -- รายได้รวม
          SUM(COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0)) as total_revenue,
          -- มูลค่าเฉลี่ยต่องาน
          ROUND(AVG(COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0)), 2) as avg_job_value,
          -- รายได้สูงสุดและต่ำสุด
          MAX(COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0)) as max_job_value,
          MIN(COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0)) as min_job_value,
          -- แยกตามประเภทงาน
          SUM(CASE WHEN dp.d_route = 'import' THEN COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0) ELSE 0 END) as import_revenue,
          SUM(CASE WHEN dp.d_route = 'export' THEN COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0) ELSE 0 END) as export_revenue,
          SUM(CASE WHEN dp.d_transport = 'SEA' THEN COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0) ELSE 0 END) as sea_revenue,
          SUM(CASE WHEN dp.d_transport = 'AIR' THEN COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0) ELSE 0 END) as air_revenue
        FROM d_purchase dp
        JOIN d_purchase_emp dpe ON dp.id = dpe.d_purchase_id
        JOIN user u ON dpe.user_id = u.id
        LEFT JOIN purchase_finance pf ON dp.id = pf.d_purchase_id
        WHERE dp.d_status IN ('ปิดการขาย', 'Financial', 'อยู่ระหว่างทำ Financial')
          AND pf.total_after_vat IS NOT NULL
          AND CAST(pf.total_after_vat AS DECIMAL(10,2)) > 0
          AND YEAR(dp.createdAt) = ${year}
          ${salespersonId && salespersonId !== 'all' ? `AND u.id = '${salespersonId}'` : ''}
        GROUP BY u.id, u.fullname, month_period, year_period
        ORDER BY year_period DESC, month_period DESC, total_revenue DESC
      `;
      const monthlyData = await prisma.$queryRawUnsafe(monthlyQuery);

      return monthlyData;
    } catch (err: any) {
      throw new Error(`getMonthlyAnalysis error: ${err.message}`);
    }
  }

  /**
   * 5. ดึงรายชื่อ Salesperson สำหรับ Filter
   */
  async getSalespersonList(): Promise<any> {
    try {
      const salespersons = await prisma.user.findMany({
        where: {
          roles: {
            roles_name: 'sale',
          },
        },
        select: {
          id: true,
          fullname: true,
          email: true,
        },
        orderBy: {
          fullname: 'asc',
        },
      });

      return salespersons;
    } catch (err: any) {
      throw new Error(`getSalespersonList error: ${err.message}`);
    }
  }

  /**
   * 6. ดึงข้อมูลจำนวนติดต่อรวม (Total Contacts) ตาม Sale และช่วงเวลา
   */
  async getTotalContactsData(filters: {
    salespersonId?: string;
    year?: number;
    month?: number;
  }): Promise<any> {
    try {
      const { salespersonId, year, month } = filters;

      const contactQuery = `
        SELECT 
          COUNT(DISTINCT c.id) as total_contacts,
          COUNT(CASE WHEN cs.cus_status = 'สนใจ' THEN 1 END) as interested_contacts,
          COUNT(CASE WHEN cs.cus_status = 'ติดตามต่อ' THEN 1 END) as follow_up_contacts,
          COUNT(CASE WHEN cs.cus_status = 'ปิดการขาย' THEN 1 END) as closed_contacts,
          u.fullname as sale_name,
          u.id as sale_id
        FROM customer c
        LEFT JOIN customer_emp ce ON c.id = ce.customer_id
        LEFT JOIN user u ON ce.user_id = u.id
        LEFT JOIN customer_status cs ON c.id = cs.customer_id AND cs.active = '1'
        WHERE 1=1
          ${salespersonId && salespersonId !== 'all' ? `AND u.id = '${salespersonId}'` : ''}
          ${year ? `AND YEAR(c.createdAt) = ${year}` : ''}
          ${month ? `AND MONTH(c.createdAt) = ${month}` : ''}
        GROUP BY u.id, u.fullname
        ORDER BY total_contacts DESC
      `;

      // Execute the query and return the results
      const result = await prisma.$queryRawUnsafe(contactQuery);
      return Array.isArray(result) ? result : [];
    } catch (err: any) {
      throw new Error(`getTotalContactsData error: ${err.message}`);
    }
  }

  /**
   * 7. ดึงข้อมูลจำนวนรอปิดการขาย (Pending Deals) ตาม Sale และช่วงเวลา
   */
  async getPendingDealsData(filters: {
    salespersonId?: string;
    year?: number;
    month?: number;
  }): Promise<any> {
    try {
      const { salespersonId, year, month } = filters;

      const pendingQuery = `
        SELECT 
          COUNT(*) as total_pending,
          SUM(CASE WHEN dp.d_status = 'Sale ตีราคา' THEN 1 ELSE 0 END) as quote_pending,
          SUM(CASE WHEN dp.d_status = 'Financial' THEN 1 ELSE 0 END) as financial_pending,
          SUM(CASE WHEN dp.d_status = 'อยู่ระหว่างทำ Financial' THEN 1 ELSE 0 END) as in_progress_pending,
          SUM(COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0)) as total_pending_value,
          u.fullname as sale_name,
          u.id as sale_id
        FROM d_purchase dp
        JOIN d_purchase_emp dpe ON dp.id = dpe.d_purchase_id
        JOIN user u ON dpe.user_id = u.id
        LEFT JOIN purchase_finance pf ON dp.id = pf.d_purchase_id
        WHERE dp.d_status != 'ปิดการขาย'
          AND dp.d_status != 'ยกเลิกคำสั่งซื้อ'
          ${salespersonId && salespersonId !== 'all' ? `AND u.id = '${salespersonId}'` : ''}
          ${year ? `AND YEAR(dp.createdAt) = ${year}` : ''}
          ${month ? `AND MONTH(dp.createdAt) = ${month}` : ''}
        GROUP BY u.id, u.fullname
        ORDER BY total_pending DESC
      `;

      const pendingData = await prisma.$queryRawUnsafe(pendingQuery);
      return Array.isArray(pendingData) ? pendingData : [];
    } catch (err: any) {
      throw new Error(`getPendingDealsData error: ${err.message}`);
    }
  }

  /**
   * 8. ดึงข้อมูลยอดขายเซลล์ (Sales Chart) รายเดือนตามปี
   */
  async getSalesChartData(filters: {
    salespersonId?: string;
    year?: number;
  }): Promise<any> {
    try {
      const { salespersonId, year = new Date().getFullYear() } = filters;

      const salesQuery = `
        SELECT 
          MONTH(dp.createdAt) as month_number,
          MONTHNAME(dp.createdAt) as month_name,
          COUNT(*) as jobs_count,
          SUM(COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0)) as total_revenue,
          AVG(COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0)) as avg_job_value,
          COUNT(CASE WHEN dp.d_status = 'ปิดการขาย' THEN 1 END) as closed_jobs,
          u.fullname as sale_name,
          u.id as sale_id
        FROM d_purchase dp
        JOIN d_purchase_emp dpe ON dp.id = dpe.d_purchase_id
        JOIN user u ON dpe.user_id = u.id
        LEFT JOIN purchase_finance pf ON dp.id = pf.d_purchase_id
  
          AND YEAR(dp.createdAt) = ${year}
          ${salespersonId && salespersonId !== 'all' ? `AND u.id = '${salespersonId}'` : ''}
        GROUP BY MONTH(dp.createdAt), MONTHNAME(dp.createdAt), u.id, u.fullname
        ORDER BY u.fullname, month_number
      `;
//      WHERE dp.d_status IN ('ปิดการขาย', 'Financial', 'อยู่ระหว่างทำ Financial')
      // Execute the query and return the results
      const result = await prisma.$queryRawUnsafe(salesQuery);
      return Array.isArray(result) ? result : [];
    } catch (err: any) {
      throw new Error(`getSalesChartData error: ${err.message}`);
    }
  }

  /**
   * 9. ดึงข้อมูลยอด Shipment ของเซลล์ (Shipment Chart) รายเดือนตามปี
   * ยอด Shipment = จำนวนงาน (1 งาน = 1 ประเภทงานสมบูรณ์)
   */
  async getShipmentChartData(filters: {
    salespersonId?: string;
    year?: number;
  }): Promise<any> {
    try {
      console.log('=== BACKEND DEBUG: getShipmentChartData ===');
      console.log('Filters:', filters);
      
      const { salespersonId, year = new Date().getFullYear() } = filters;

      const shipmentQuery = `
        SELECT 
          MONTH(dp.createdAt) as month_number,
          TRIM(BOTH '-' FROM CONCAT(
            CASE WHEN dp.d_route IS NOT NULL AND dp.d_route != '' THEN dp.d_route ELSE '' END,
            CASE WHEN dp.d_transport IS NOT NULL AND dp.d_transport != '' THEN CONCAT('-', dp.d_transport) ELSE '' END,
            CASE WHEN dp.d_term IS NOT NULL AND dp.d_term != '' THEN CONCAT('-', dp.d_term) ELSE '' END
          )) as job_type_combination,
          COUNT(*) as shipment_count,
          SUM(COALESCE(CAST(pf.total_after_vat AS DECIMAL(10,2)), 0)) as shipment_value,
          u.fullname as sale_name,
          u.id as sale_id
        FROM d_purchase dp
        JOIN d_purchase_emp dpe ON dp.id = dpe.d_purchase_id
        JOIN user u ON dpe.user_id = u.id
        JOIN roles r ON u.roles_id = r.id
        LEFT JOIN purchase_finance pf ON dp.id = pf.d_purchase_id
        WHERE YEAR(dp.createdAt) = ${year}
          AND r.roles_name IN ('Sales', 'sales', 'SALES')
          ${salespersonId && salespersonId !== 'all' ? `AND u.id = '${salespersonId}'` : ''}
        GROUP BY MONTH(dp.createdAt), job_type_combination, u.id, u.fullname
        ORDER BY u.fullname, month_number, shipment_count DESC
      `;

      console.log('Shipment query:', shipmentQuery);
      const result = await prisma.$queryRawUnsafe(shipmentQuery);

      console.log('Shipment query result:', result);
      return Array.isArray(result) ? result : [];
    } catch (err: any) {
      console.error('getShipmentChartData error:', err);
      throw new Error(`getShipmentChartData error: ${err.message}`);
    }
  }

  /**
   * 6. ดึงข้อมูลสถิติเปรียบเทียบ (สำหรับ Trend Analysis)
   */
  async getTrendComparison(filters: {
    salespersonId?: string;
    currentPeriod: { startDate: Date; endDate: Date };
    previousPeriod: { startDate: Date; endDate: Date };
  }): Promise<any> {
    try {
      const { salespersonId, currentPeriod, previousPeriod } = filters;

      const purchaseFilter = salespersonId && salespersonId !== 'all'
        ? 'AND dpe.user_id = ?' 
        : '';

      // Current period data
      const currentData = await this.getDashboardKPIs({
        salespersonId,
        startDate: currentPeriod.startDate,
        endDate: currentPeriod.endDate,
      });

      // Previous period data
      const previousData = await this.getDashboardKPIs({
        salespersonId,
        startDate: previousPeriod.startDate,
        endDate: previousPeriod.endDate,
      });

      // Calculate trends
      const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        current: currentData,
        previous: previousData,
        trends: {
          contacts: calculateTrend(currentData.totalContacts, previousData.totalContacts),
          deals: calculateTrend(currentData.pendingDeals, previousData.pendingDeals),
          revenue: calculateTrend(currentData.totalRevenue, previousData.totalRevenue),
          shipments: calculateTrend(currentData.totalShipments, previousData.totalShipments),
        },
      };
    } catch (err: any) {
      throw new Error(`getTrendComparison error: ${err.message}`);
    }
  }

  /**
   * ดึงรายชื่อเซลส์ที่มีอยู่ในระบบ
   */
  async getAvailableSalespersons(): Promise<any[]> {
    try {
      const salespersons = await prisma.$queryRaw`
        SELECT DISTINCT u.id, u.fullname, u.email, r.roles_name
        FROM user u
        JOIN roles r ON u.roles_id = r.id
        WHERE LOWER(r.roles_name) = 'sales'
        ORDER BY u.fullname
      `;
      
      return salespersons as any[];
    } catch (error) {
      console.error('Error in getAvailableSalespersons:', error);
      throw error;
    }
  }

}

export default SaleDashboardRepository;
