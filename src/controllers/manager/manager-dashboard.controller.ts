import { Request, Response } from 'express';
import SaleDashboardService from '../../services/dashboard/sale-dashboard.service';
import { CSDashboardService } from '../../services/dashboard/cs-dashboard.service';
import AccountDashboardService from '../../services/dashboard/account-dashboard.service';
import { z } from 'zod';

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
  private csDashboardService: CSDashboardService;

  constructor() {
    this.saleDashboardService = new SaleDashboardService();
    this.csDashboardService = new CSDashboardService();
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
      
      const { salespersonId, year, month, startMonth, endMonth } = req.query;
      
      console.log('Parsed filters:', { salespersonId, year, month, startMonth, endMonth });

      // Handle month filtering - if month is specified, use it for both start and end
      let actualStartMonth = startMonth ? parseInt(startMonth as string) : 1;
      let actualEndMonth = endMonth ? parseInt(endMonth as string) : 12;
      
      if (month && month !== 'all') {
        actualStartMonth = parseInt(month as string);
        actualEndMonth = parseInt(month as string);
      }

      // Get shipment data from service with proper month filtering
      const shipmentResponse = await this.saleDashboardService.getShipmentChartData({
        salespersonId: salespersonId as string,
        year: year ? parseInt(year as string) : new Date().getFullYear(),
        startMonth: actualStartMonth,
        endMonth: actualEndMonth
      });

      console.log('=== SHIPMENT SERVICE RESPONSE ===');
      console.log('Service response:', shipmentResponse);
      
      // Extract data from service response
      const chartData = shipmentResponse?.data?.chartData || [];
      const serviceSummary = shipmentResponse?.data?.summary || null;
      
      console.log('Chart data:', chartData);
      console.log('Service summary:', serviceSummary);

      // Get available salespersons
      const availableSalespersons = await this.saleDashboardService.getAvailableSalespersons();
      
      // Calculate summary from chart data if service doesn't provide it
      let summary = serviceSummary;
      if (!summary && Array.isArray(chartData)) {
        let totalShipments = 0;
        let totalValue = 0;
        
        chartData.forEach((series: any) => {
          if (series.data && Array.isArray(series.data)) {
            series.data.forEach((point: any) => {
              totalShipments += point.y || 0;
              totalValue += point.value || 0;
            });
          }
        });
        
        const monthCount = actualEndMonth - actualStartMonth + 1;
        summary = {
          totalShipments,
          totalValue,
          averageShipmentsPerMonth: monthCount > 0 ? totalShipments / monthCount : 0
        };
      }
      
      // Generate metadata
      const metadata = {
        totalJobTypes: Array.isArray(chartData) ? chartData.length : 0,
        dataPoints: Array.isArray(chartData) ? chartData.reduce((sum: number, series: any) => sum + (series.data?.length || 0), 0) : 0,
        period: `${year}/${actualStartMonth}-${actualEndMonth}`,
      };

      console.log('=== FINAL SUMMARY & METADATA ===');
      console.log('Summary:', summary);
      console.log('Metadata:', metadata);

      const responseData = {
        chartType: 'line',
        chartData: chartData,
        summary,
        filters: {
          selectedSalesperson: salespersonId,
          selectedYear: year,
          monthRange: { start: actualStartMonth, end: actualEndMonth },
          availableSalespersons: Array.isArray(availableSalespersons?.data) 
            ? availableSalespersons.data.map((sp: any) => ({
                id: sp.id,
                name: sp.name || sp.fullname || sp.email,
                email: sp.email,
                roles_name: sp.role || sp.roles_name
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
      const { startDate, endDate, transport, route, term } = req.query;
      
      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        transport: transport as string,
        route: route as string,
        term: term as string
      };

      // Get real data from CSDashboardService
      const dashboardData = await this.csDashboardService.getDashboardData(filters);

      res.json({
        success: true,
        data: dashboardData,
        message: 'CS dashboard data retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching CS dashboard data:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  // Account Dashboard Data
  async getAccountDashboardData(req: Request, res: Response): Promise<any> {
    try {
      const { startDate, endDate, period } = req.query;
      
      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        period: (period as 'day' | 'month' | 'year') || 'month'
      };

      // Get complete data from AccountDashboardService
      const [
        kpis, 
        shippingMetrics, 
        revenueMetrics, 
        costMetrics, 
        monthlyData, 
        revenueProportions, 
        expenseProportions,
        transactionAnalysis, 
        topCustomers
      ] = await Promise.all([
        AccountDashboardService.getAccountKPIs(filters),
        AccountDashboardService.getShippingMetrics(filters),
        AccountDashboardService.getRevenueMetrics(filters),
        AccountDashboardService.getCostMetrics(filters),
        AccountDashboardService.getMonthlyRevenueExpense(filters),
        AccountDashboardService.getRevenueProportions(filters),
        AccountDashboardService.getExpenseProportions(filters),
        AccountDashboardService.getTransactionAnalysis(filters),
        AccountDashboardService.getTopCustomers(filters)
      ]);

      // Format monthly data for frontend consumption
      const monthlyDataFormatted = monthlyData.map(item => ({
        month: item.month,
        depositRevenue: 0, // Will be calculated from revenueProportions if needed
        exchangeRevenue: 0, // Will be calculated from revenueProportions if needed
        totalRevenue: item.totalRevenue,
        totalCost: item.totalCost,
        grossProfit: item.grossProfit,
        netProfit: item.netProfit
      }));

      // Complete response data matching frontend interface
      const responseData = {
        kpis: {
          pendingShipments: kpis.pendingShipments,
          totalWithdrawalAmount: kpis.totalWithdrawalAmount,
          totalClearedAmount: kpis.totalClearedAmount,
          remainingBalance: kpis.remainingBalance,
          totalRevenue: kpis.totalRevenue,
          revenueBeforeVat: kpis.revenueBeforeVat,
          costOfSales: kpis.costOfSales,
          totalAllExpenses: kpis.totalAllExpenses,
          costPercentage: kpis.costPercentage,
          grossProfit: kpis.grossProfit,
          netProfit: kpis.netProfit,
          profitMargin: kpis.profitMargin
        },
        shippingMetrics: {
          pendingShipments: shippingMetrics.pendingShipments,
          totalWithdrawalAmount: shippingMetrics.totalWithdrawalAmount,
          totalClearedAmount: shippingMetrics.totalClearedAmount,
          remainingBalance: shippingMetrics.remainingBalance
        },
        revenueMetrics: {
          totalDepositRevenue: revenueMetrics.totalDepositRevenue,
          totalExchangeRevenue: revenueMetrics.totalExchangeRevenue,
          totalRevenue: revenueMetrics.totalRevenue,
          revenueBeforeVat: revenueMetrics.revenueBeforeVat
        },
        costMetrics: {
          totalPurchaseCost: costMetrics.totalPurchaseCost,
          totalVatAmount: costMetrics.totalVatAmount,
          costOfSales: costMetrics.costOfSales,
          totalShippingCost: costMetrics.totalShippingCost,
          totalChinaExpenses: costMetrics.totalChinaExpenses,
          totalThailandExpenses: costMetrics.totalThailandExpenses,
          totalAllExpenses: costMetrics.totalAllExpenses,
          costPercentage: costMetrics.costPercentage,
          expenseBreakdown: costMetrics.expenseBreakdown || {
            employeeCost: 0,
            warehouseCost: 0,
            customsCost: 0,
            portFees: 0,
            otherExpenses: 0
          }
        },
        monthlyData: monthlyDataFormatted,
        transactionAnalysis: {
          totalDepositTransactions: transactionAnalysis.totalDepositTransactions,
          totalTransferTransactions: transactionAnalysis.totalTransferTransactions,
          depositAmountRMB: transactionAnalysis.depositAmountRMB,
          transferAmountRMB: transactionAnalysis.transferAmountRMB,
          totalTransactionRMB: transactionAnalysis.totalTransactionRMB,
          depositAmountTHB: transactionAnalysis.depositAmountTHB,
          transferAmountTHB: transactionAnalysis.transferAmountTHB,
          totalTransactionTHB: transactionAnalysis.totalTransactionTHB
        },
        topCustomers: topCustomers.map(customer => ({
          customerId: customer.customerId,
          customerName: customer.customerName,
          totalOrders: customer.totalOrders,
          totalBillingAmount: customer.totalBillingAmount,
          totalAmount: customer.totalAmount,
          transactionCount: customer.transactionCount
        })),
        revenueProportions: {
          depositRevenue: revenueProportions.depositRevenue,
          exchangeRevenue: revenueProportions.exchangeRevenue,
          depositPercentage: revenueProportions.depositPercentage,
          exchangePercentage: revenueProportions.exchangePercentage
        },
        expenseProportions: expenseProportions.map(expense => ({
          category: expense.category,
          amount: expense.amount,
          percentage: expense.percentage
        })),
        plAnalysis: {
          grossProfit: kpis.grossProfit,
          netProfit: kpis.netProfit,
          profitMargin: kpis.profitMargin,
          costPercentage: kpis.costPercentage
        },
        rmbTracking: {
          depositAmountRMB: transactionAnalysis.depositAmountRMB,
          transferAmountRMB: transactionAnalysis.transferAmountRMB,
          totalTransactionRMB: transactionAnalysis.totalTransactionRMB,
          depositAmountTHB: transactionAnalysis.depositAmountTHB,
          transferAmountTHB: transactionAnalysis.transferAmountTHB,
          totalTransactionTHB: transactionAnalysis.totalTransactionTHB
        }
      };

      res.json({
        success: true,
        data: responseData,
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

  // Sales Chart Data
  async getSalesChartData(req: Request, res: Response): Promise<any> {
    try {
      const { salespersonId, year, month, startDate, endDate } = req.query;

      const filters = {
        salespersonId: salespersonId === 'all' ? undefined : salespersonId as string,
        year: year ? parseInt(year as string) : new Date().getFullYear(),
        month: month && month !== 'all' ? parseInt(month as string) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
      };

      console.log('=== SALES CHART API ===');
      console.log('Filters:', filters);

      const data = await this.saleDashboardService.getSalesChartData(filters);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error fetching sales chart data:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Get salesperson options for dropdown
   */
  async getSalespersonOptions(req: Request, res: Response): Promise<void> {
    try {
      console.log('=== GET SALESPERSON OPTIONS ===');
      
      const salespersonOptions = await this.saleDashboardService.getSalespersonOptions();
      
      console.log('Salesperson Options:', salespersonOptions);
      
      res.status(200).json({
        success: true,
        message: 'Salesperson options retrieved successfully',
        data: salespersonOptions
      });
    } catch (error: any) {
      console.error('Error in getSalespersonOptions:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get all salespersons for dropdown filter
   */
  async getAllSalespersons(req: Request, res: Response): Promise<void> {
    try {
      console.log('=== GET ALL SALESPERSONS ===');
      
      const salespersons = await this.saleDashboardService.getAllSalespersons();
      
      console.log('All Salespersons:', salespersons);
      
      res.status(200).json({
        success: true,
        message: 'All salespersons retrieved successfully',
        data: salespersons
      });
    } catch (error: any) {
      console.error('Error in getAllSalespersons:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        data: null
      });
    }
  }
}
