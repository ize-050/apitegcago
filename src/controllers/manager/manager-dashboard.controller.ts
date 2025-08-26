import { Request, Response } from "express";
import z from "zod";
import SaleDashboardService from "../../services/dashboard/sale-dashboard.service";

// Validation schemas
const dateFilterSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  period: z.enum(['day', 'month', 'year']).optional().default('month'),
  salespersonId: z.string().optional(),
});

const shipmentChartFilterSchema = z.object({
  salespersonId: z.string().optional().default('all'),
  year: z.coerce.number().optional().default(new Date().getFullYear()),
  startMonth: z.coerce.number().min(1).max(12).optional().default(1),
  endMonth: z.coerce.number().min(1).max(12).optional().default(12),
});

export class ManagerDashboardController {
  private saleDashboardService: SaleDashboardService;

  constructor() {
    this.saleDashboardService = new SaleDashboardService();
  }
  
  // Sale Dashboard Data
  async getSaleDashboardData(req: Request, res: Response): Promise<any> {
    try {
      const { startDate, endDate, period, salespersonId } = dateFilterSchema.parse(req.query);

      // Get real data from SaleDashboardService
      const [overview, salesChart, shipmentChart, totalContacts, pendingDeals] = await Promise.all([
        this.saleDashboardService.getDashboardOverview({
          salespersonId,
          startDate,
          endDate,
        }),
        this.saleDashboardService.getSalesChartData({
          salespersonId,
          year: new Date().getFullYear(),
        }),
        this.saleDashboardService.getShipmentChartData({
          salespersonId,
          year: new Date().getFullYear(),
        }),
        this.saleDashboardService.getTotalContactsData({
          salespersonId,
          year: new Date().getFullYear(),
        }),
        this.saleDashboardService.getPendingDealsData({
          salespersonId,
          year: new Date().getFullYear(),
        }),
      ]);

  

      // Transform data to match frontend expectations
      const responseData = {
        kpis: {
          totalContacts: overview.kpis.totalContacts?.value || 0,
          pendingDeals: overview.kpis.pendingDeals?.value || 0,
          totalSales: overview.kpis.totalRevenue?.value || 0,
          shipmentCount: overview.kpis.totalShipments?.value || 0,
        },
        salesData: this.transformSalesChartToMonthly(salesChart.chartData || []),
        shipmentData: this.transformShipmentChartToMonthly(shipmentChart.chartData || []),
        salespersonPerformance: this.transformToSalespersonPerformance(totalContacts.data || [], pendingDeals.data || []),
      };

      res.status(200).json({
        success: true,
        data: responseData,
        message: "Sale dashboard data retrieved successfully",
      });
    } catch (error: any) {
      console.error('Error fetching sale dashboard data:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Shipment Chart Data - Dedicated endpoint for line chart
  async getShipmentChartData(req: Request, res: Response): Promise<any> {
    try {
      console.log('=== MANAGER DASHBOARD DEBUG ===');
      console.log('Request params:', req.query);
      
      const { salespersonId, year, startMonth, endMonth } = req.query;
      
      console.log('Parsed filters:', { salespersonId, year, startMonth, endMonth });

      // Get raw shipment data directly from repository to preserve job_type_combination
      const rawShipmentData = await this.saleDashboardService.getShipmentChartData({
        salespersonId: salespersonId as string,
        year: year ? parseInt(year as string) : new Date().getFullYear()
      });

      console.log('=== RAW SHIPMENT DATA ===');
      console.log('Raw shipment data:', rawShipmentData);
      console.log('Raw data type:', typeof rawShipmentData);
      console.log('Raw data keys:', rawShipmentData ? Object.keys(rawShipmentData) : 'null');
      
      // Check if data is nested in response structure
      const actualData = rawShipmentData?.data?.chartData || rawShipmentData?.data || rawShipmentData;
      console.log('Actual data:', actualData);
      console.log('Actual data is array:', Array.isArray(actualData));
      console.log('Actual data length:', actualData?.length);
      if (Array.isArray(actualData)) {
        console.log('Sample actual data:', actualData.slice(0, 3));
      }

      // Get available salespersons
      const availableSalespersons = await this.saleDashboardService.getAvailableSalespersons();
      
      // ใช้ข้อมูลที่ถูกต้องจาก actualData
      const serviceData = actualData;
      
      // Calculate summary statistics จากข้อมูลดิบ (ตรวจสอบว่าเป็น array ก่อน)
      const summary = {
        totalShipments: Array.isArray(serviceData) ? serviceData.reduce((sum: number, item: any) => sum + (parseInt(item.shipment_count) || 0), 0) : 0,
        totalValue: Array.isArray(serviceData) ? serviceData.reduce((sum: number, item: any) => sum + (parseFloat(item.shipment_value) || 0), 0) : 0,
        averageShipmentsPerMonth: Array.isArray(serviceData) && serviceData.length ? (serviceData.reduce((sum: number, item: any) => sum + (parseInt(item.shipment_count) || 0), 0) / 12) : 0
      };
      
      // Generate metadata
      const metadata = {
        totalJobTypes: Array.isArray(serviceData) ? [...new Set(serviceData.map((item: any) => item.job_type_combination) || [])].length : 0,
        dataPoints: Array.isArray(serviceData) ? serviceData.length : 0,
        period: `${year}/${startMonth || 1}-${endMonth || 12}`,
      };

      console.log('=== FINAL SUMMARY & METADATA ===');
      console.log('Summary:', summary);
      console.log('Metadata:', metadata);
      console.log('Service data type:', typeof serviceData);
      console.log('Service data is array:', Array.isArray(serviceData));

      const responseData = {
        chartType: 'line',
        chartData: serviceData, // ส่งข้อมูลที่ถูกต้อง
        summary,
        filters: {
          selectedSalesperson: salespersonId,
          selectedYear: year,
          monthRange: { start: startMonth, end: endMonth },
          availableSalespersons: Array.isArray(availableSalespersons) 
            ? availableSalespersons.map((sp: any) => ({
                id: sp.id,
                name: sp.fullname || sp.email,
                email: sp.email,
                roles_name: sp.roles_name
              }))
            : []
        },
        metadata
      };

      res.status(200).json({
        success: true,
        data: responseData,
        message: "Shipment chart data retrieved successfully",
      });
    } catch (error: any) {
      console.error('Error fetching shipment chart data:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  // Helper methods for data transformation
  private transformSalesChartToMonthly(chartData: any[]): any[] {
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    
    // Initialize monthly data structure
    const monthlyData = monthNames.map((month, index) => ({
      period: month,
      sales: 0,
      revenue: 0,
      contacts: 0,
      pending: 0
    }));

    // Aggregate data from all salespersons
    chartData.forEach(salesperson => {
      salesperson.data.forEach((dataPoint: any, index: number) => {
        if (index < monthlyData.length) {
          monthlyData[index].revenue += dataPoint.y || 0;
          monthlyData[index].sales += 1; // Count as one sale per data point
        }
      });
    });

    return monthlyData;
  }

  private transformShipmentChartToMonthly(chartData: any[]): any[] {
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    

    // Initialize monthly data structure
    const monthlyData = monthNames.map((month, index) => ({
      period: month,
      shipments: 0,
      value: 0
    }));

    // Aggregate shipment data from all job types
    chartData.forEach((jobType, jobIndex) => {
      
      if (jobType && jobType.data && Array.isArray(jobType.data)) {
        jobType.data.forEach((dataPoint: any, dataIndex: number) => {
          console.log(`  DataPoint ${dataIndex}:`, dataPoint);
          
          // Map month name to index
          const monthIndex = monthNames.findIndex(month => month === dataPoint.x);
          if (monthIndex !== -1 && monthIndex < monthlyData.length) {
            const shipmentValue = parseInt(dataPoint.y) || 0;
            monthlyData[monthIndex].shipments += shipmentValue;
            // Remove estimated value calculation - use actual data from service
            
            console.log(` Added ${shipmentValue} to month ${monthNames[monthIndex]} (index: ${monthIndex})`);
          }
        });
      }
    });

    console.log("Final monthlyData:", monthlyData);
    return monthlyData;
  }

  private transformToSalespersonPerformance(contactsData: any[], pendingData: any[]): any[] {
    const performanceMap = new Map();

    // Process contacts data
    contactsData.forEach(contact => {
      performanceMap.set(contact.saleId, {
        name: contact.saleName,
        contacts: contact.totalContacts,
        deals: contact.closedContacts,
        revenue: 0,
        conversion: parseFloat(contact.conversionRate)
      });
    });

    // Add pending deals data
    pendingData.forEach(pending => {
      if (performanceMap.has(pending.saleId)) {
        const existing = performanceMap.get(pending.saleId);
        existing.revenue = pending.totalPendingValue;
        performanceMap.set(pending.saleId, existing);
      }
    });

    return Array.from(performanceMap.values());
  }

  // Transform shipment data for line chart format
  private transformShipmentDataForLineChart(chartData: any[]): any[] {
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    // Transform existing chart data to line chart format
    return chartData.map((series: any, index: number) => ({
      id: series.id || `Job Type ${index + 1}`,
      color: series.color || `hsl(${index * 45}, 70%, 50%)`,
      data: series.data?.map((point: any) => ({
        x: point.x,
        y: point.y,
        value: point.value || point.y * 50000 // Estimated value
      })) || monthNames.map((month, monthIndex) => ({
        x: month,
        y: Math.floor(Math.random() * 20) + 5,
        value: Math.floor(Math.random() * 100000) + 50000
      }))
    }));
  }

  // Calculate summary statistics for shipment data
  private calculateShipmentSummary(chartData: any[]): any {
    let totalShipments = 0;
    let totalValue = 0;
    let dataPointCount = 0;

    chartData.forEach((series: any) => {
      series.data.forEach((point: any) => {
        totalShipments += point.y || 0;
        totalValue += point.value || 0;
        dataPointCount++;
      });
    });

    return {
      totalShipments,
      totalValue,
      averageShipmentsPerMonth: dataPointCount > 0 ? totalShipments / (dataPointCount / chartData.length) : 0
    };
  }

  // CS Dashboard Data
  async getCSDashboardData(req: Request, res: Response): Promise<any> {
    try {
      const { startDate, endDate } = dateFilterSchema.parse(req.query);

      // Mock data for CS Dashboard
      const mockData = {
        kpis: {
          newRequests: 45,
          quotations: 38,
          proposals: 32,
          acceptedJobs: 28,
        },
        shipmentAnalysis: [
          { id: 'Import', label: 'Import', value: 65 },
          { id: 'Export', label: 'Export', value: 35 },
        ],
        portAnalysis: [
          { port: 'กรุงเทพ', import: 25, export: 15 },
          { port: 'ลาดกระบัง', import: 20, export: 12 },
          { port: 'แหลมฉบัง', import: 15, export: 8 },
          { port: 'เชียงใหม่', import: 5, export: 0 },
        ],
        productTypes: [
          { id: 'อิเล็กทรอนิกส์', label: 'อิเล็กทรอนิกส์', value: 30 },
          { id: 'เสื้อผ้า', label: 'เสื้อผ้า', value: 25 },
          { id: 'อาหาร', label: 'อาหาร', value: 20 },
          { id: 'เครื่องจักร', label: 'เครื่องจักร', value: 15 },
          { id: 'อื่นๆ', label: 'อื่นๆ', value: 10 },
        ],
        containerStatus: [
          { status: 'รอจองตู้', count: 12 },
          { status: 'จองแล้ว', count: 18 },
          { status: 'รอรับตู้', count: 8 },
          { status: 'ได้รับตู้แล้ว', count: 15 },
        ],
        documentStatus: [
          { status: 'รอจัดทำ', count: 10 },
          { status: 'กำลังจัดทำ', count: 15 },
          { status: 'เสร็จสิ้น', count: 25 },
        ],
        departureStatus: [
          { status: 'รอออกเดินทาง', count: 8 },
          { status: 'กำลังขนส่ง', count: 12 },
          { status: 'ถึงปลายทางแล้ว', count: 20 },
        ],
        deliveryStatus: [
          { status: 'รอจัดส่ง', count: 5 },
          { status: 'กำลังจัดส่ง', count: 8 },
          { status: 'จัดส่งเสร็จสิ้น', count: 27 },
        ],
      };

      res.json({
        success: true,
        data: mockData,
      });
    } catch (error) {
      console.error('Error fetching CS dashboard data:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Account Dashboard Data
  async getAccountDashboardData(req: Request, res: Response): Promise<any> {
    try {
      const { startDate, endDate } = dateFilterSchema.parse(req.query);

      // Mock data for Account Dashboard
      const mockData = {
        kpis: {
          totalRevenue: 15800000,
          totalExpenses: 12200000,
          netProfit: 3600000,
          profitMargin: 22.8,
          withdrawalAmount: 2800000,
          clearingAmount: 1900000,
          rmbDeposits: 850000,
        },
        revenueTrends: [
          { period: 'ม.ค.', revenue: 2200000, expenses: 1800000, profit: 400000 },
          { period: 'ก.พ.', revenue: 2400000, expenses: 1900000, profit: 500000 },
          { period: 'มี.ค.', revenue: 2600000, expenses: 2100000, profit: 500000 },
          { period: 'เม.ย.', revenue: 2800000, expenses: 2200000, profit: 600000 },
          { period: 'พ.ค.', revenue: 3000000, expenses: 2400000, profit: 600000 },
          { period: 'มิ.ย.', revenue: 2800000, expenses: 1800000, profit: 1000000 },
        ],
        plAnalysis: [
          { category: 'รายได้จากการขาย', amount: 12500000, percentage: 79.1 },
          { category: 'รายได้จากค่าธรรมเนียม', amount: 2100000, percentage: 13.3 },
          { category: 'รายได้จากอัตราแลกเปลี่ยน', amount: 1200000, percentage: 7.6 },
        ],
        rmbTracking: [
          { type: 'ยอดฝาก RMB', amount: 850000, trend: 'up', change: 12.5 },
          { type: 'ยอดเบิก RMB', amount: 720000, trend: 'down', change: -8.3 },
          { type: 'ยอดคงเหลือ RMB', amount: 130000, trend: 'up', change: 15.2 },
          { type: 'อัตราแลกเปลี่ยนเฉลี่ย', amount: 4.85, trend: 'stable', change: 0.2 },
        ],
      };

      res.json({
        success: true,
        data: mockData,
      });
    } catch (error) {
      console.error('Error fetching account dashboard data:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // HR Dashboard Data
  async getHRDashboardData(req: Request, res: Response): Promise<any> {
    try {
      const { startDate, endDate } = dateFilterSchema.parse(req.query);

      // Mock data for HR Dashboard
      const mockData = {
        kpis: {
          totalCommission: 485000,
          pendingCommission: 125000,
          approvedCommission: 180000,
          paidCommission: 180000,
          totalEmployees: 12,
          activeEmployees: 8,
        },
        employeePerformance: [
          { id: 1, name: 'สมชาย', totalCommission: 85000, completedJobs: 15, pendingJobs: 3, averageCommission: 5667 },
          { id: 2, name: 'มาลี', totalCommission: 92000, completedJobs: 18, pendingJobs: 2, averageCommission: 5111 },
          { id: 3, name: 'วิชัย', totalCommission: 120000, completedJobs: 22, pendingJobs: 5, averageCommission: 5455 },
          { id: 4, name: 'สุดา', totalCommission: 143000, completedJobs: 28, pendingJobs: 4, averageCommission: 5107 },
          { id: 5, name: 'ประยุทธ', totalCommission: 45000, completedJobs: 8, pendingJobs: 2, averageCommission: 5625 },
        ],
        commissionTrends: [
          { period: 'ม.ค.', total: 65000, pending: 15000, approved: 25000, paid: 25000 },
          { period: 'ก.พ.', total: 72000, pending: 18000, approved: 27000, paid: 27000 },
          { period: 'มี.ค.', total: 78000, pending: 20000, approved: 29000, paid: 29000 },
          { period: 'เม.ย.', total: 85000, pending: 22000, approved: 31500, paid: 31500 },
          { period: 'พ.ค.', total: 92000, pending: 25000, approved: 33500, paid: 33500 },
          { period: 'มิ.ย.', total: 93000, pending: 25000, approved: 34000, paid: 34000 },
        ],
        departmentPerformance: [
          { department: 'Sale', employees: 8, totalCommission: 385000, avgCommission: 48125 },
          { department: 'CS', employees: 3, totalCommission: 75000, avgCommission: 25000 },
          { department: 'Account', employees: 1, totalCommission: 25000, avgCommission: 25000 },
        ],
      };

      res.json({
        success: true,
        data: mockData,
      });
    } catch (error) {
      console.error('Error fetching HR dashboard data:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

