import SaleDashboardRepository from "../../repository/dashboard/sale-dashboard.repository";
import moment from "moment";

/**
 * Sale Dashboard Service
 * จัดการ Business Logic สำหรับ Sale Dashboard
 * แยกออกจาก Sale Service เดิมเพื่อความชัดเจนและไม่ชนกัน
 */
class SaleDashboardService {
  private saleDashboardRepo: SaleDashboardRepository;

  constructor() {
    this.saleDashboardRepo = new SaleDashboardRepository();
  }

  /**
   * 1. ดึงข้อมูล Dashboard Overview (KPI Cards + Trends)
   */
  async getDashboardOverview(filters: {
    salespersonId?: string;
    dateRange?: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      // Parse date range
      const dateRanges = this.parseDateRange(filters.dateRange, filters.startDate, filters.endDate);
      
      // Get current period data
      const currentKPIs = await this.saleDashboardRepo.getDashboardKPIs({
        salespersonId: filters.salespersonId,
        startDate: dateRanges.current.startDate,
        endDate: dateRanges.current.endDate,
      });

      // Get trend comparison
      const trendData = await this.saleDashboardRepo.getTrendComparison({
        salespersonId: filters.salespersonId,
        currentPeriod: dateRanges.current,
        previousPeriod: dateRanges.previous,
      });

      // Format response
      return {
        kpis: {
          totalContacts: {
            value: currentKPIs.totalContacts,
            trend: trendData.trends.contacts,
            previousValue: trendData.previous.totalContacts,
          },
          pendingDeals: {
            value: currentKPIs.pendingDeals,
            trend: trendData.trends.deals,
            previousValue: trendData.previous.pendingDeals,
          },
          totalRevenue: {
            value: currentKPIs.totalRevenue,
            trend: trendData.trends.revenue,
            previousValue: trendData.previous.totalRevenue,
            formatted: this.formatCurrency(currentKPIs.totalRevenue),
          },
          totalShipments: {
            value: currentKPIs.totalShipments,
            trend: trendData.trends.shipments,
            previousValue: trendData.previous.totalShipments,
          },
        },
        period: {
          current: dateRanges.current,
          previous: dateRanges.previous,
          label: this.getDateRangeLabel(filters.dateRange),
        },
      };
    } catch (err: any) {
      throw new Error(`getDashboardOverview error: ${err.message}`);
    }
  }

  /**
   * 2. ดึงข้อมูลสำหรับ Revenue Trend Chart
   */
  async getRevenueChartData(filters: {
    salespersonId?: string;
    dateRange?: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<any> {
    try {
      const dateRanges = this.parseDateRange(filters.dateRange, filters.startDate, filters.endDate);
      
      const revenueData = await this.saleDashboardRepo.getRevenueByJobType({
        salespersonId: filters.salespersonId,
        startDate: dateRanges.current.startDate,
        endDate: dateRanges.current.endDate,
        groupBy: filters.groupBy || 'month',
      });

      // Transform data for Chart.js format
      const chartData = this.transformRevenueDataForChart(revenueData);

      return {
        chartData,
        rawData: revenueData,
        summary: {
          totalRevenue: chartData.datasets.reduce((sum: number, dataset: any) => 
            sum + dataset.data.reduce((a: number, b: number) => a + b, 0), 0
          ),
          totalJobs: revenueData.reduce((sum: any, item: any) => sum + item.job_count, 0),
        },
      };
    } catch (err: any) {
      throw new Error(`getRevenueChartData error: ${err.message}`);
    }
  }

  /**
   * 3. ดึงข้อมูลสำหรับ Job Volume Chart
   */
  async getJobVolumeChartData(filters: {
    salespersonId?: string;
    dateRange?: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const dateRanges = this.parseDateRange(filters.dateRange, filters.startDate, filters.endDate);
      
      const jobVolumeData = await this.saleDashboardRepo.getJobVolumeByType({
        salespersonId: filters.salespersonId,
        startDate: dateRanges.current.startDate,
        endDate: dateRanges.current.endDate,
      });

      // Transform data for Chart.js format
      const chartData = this.transformJobVolumeDataForChart(jobVolumeData);

      return {
        chartData,
        rawData: jobVolumeData,
        summary: {
          totalJobs: jobVolumeData.reduce((sum: any, item: any) => sum + item.total_jobs, 0),
          totalSalespersons: jobVolumeData.length,
        },
      };
    } catch (err: any) {
      throw new Error(`getJobVolumeChartData error: ${err.message}`);
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
      const trendData = await this.saleDashboardRepo.getJobTypeMonthlyTrend(filters);
      
      // Format data for Nivo Line Chart
      const formattedData = this.formatJobTypeMonthlyTrend(trendData);
      
      return {
        chartData: formattedData.chartData,
        summary: formattedData.summary,
        jobTypes: formattedData.jobTypes,
      };
    } catch (error: any) {
      throw new Error(`getJobTypeMonthlyTrend error: ${error.message}`);
    }
  }

  /**
   * 5. ดึงข้อมูลการวิเคราะห์รายเดือน
   */
  async getMonthlyAnalysis(filters: {
    salespersonId?: string;
    year?: number;
  }): Promise<any> {
    try {
      const monthlyData = await this.saleDashboardRepo.getMonthlyAnalysis(filters);
      
      // Format data for charts
      const formattedData = this.formatMonthlyData(monthlyData);
      

      return {
        monthlyBreakdown: formattedData.monthlyBreakdown,
        yearlyTotals: formattedData.yearlyTotals,
        trends: formattedData.trends,
      };
    } catch (error: any) {
      throw new Error(`getMonthlyAnalysis error: ${error.message}`);
    }
  }

  /**
   * 5. ดึงรายชื่อ Salesperson สำหรับ Filter
   */
  async getSalespersonOptions(): Promise<any> {
    try {
      const salespersons = await this.saleDashboardRepo.getSalespersonList();
      
      return [
        { id: 'all', name: 'All Salespersons', email: null },
        ...salespersons,
      ];
    } catch (err: any) {
      throw new Error(`getSalespersonOptions error: ${err.message}`);
    }
  }

  /**
   * 6. ดึงข้อมูลจำนวนติดต่อรวม (Total Contacts)
   */
  async getTotalContactsData(filters: {
    salespersonId?: string;
    year?: number;
    month?: number;
  }): Promise<any> {
    try {
      const rawData = await this.saleDashboardRepo.getTotalContactsData(filters);
      
      // Format data for frontend
      const formattedData = rawData.map((item: any) => ({
        saleId: item.sale_id,
        saleName: item.sale_name,
        totalContacts: parseInt(item.total_contacts || 0),
        interestedContacts: parseInt(item.interested_contacts || 0),
        followUpContacts: parseInt(item.follow_up_contacts || 0),
        closedContacts: parseInt(item.closed_contacts || 0),
        conversionRate: item.total_contacts > 0 
          ? ((parseInt(item.closed_contacts || 0) / parseInt(item.total_contacts || 0)) * 100).toFixed(2)
          : '0.00'
      }));

      return {
        data: formattedData,
        summary: {
          totalContacts: formattedData.reduce((sum: number, item: any) => sum + item.totalContacts, 0),
          totalClosed: formattedData.reduce((sum: number, item: any) => sum + item.closedContacts, 0),
          avgConversionRate: formattedData.length > 0 
            ? (formattedData.reduce((sum: number, item: any) => sum + parseFloat(item.conversionRate), 0) / formattedData.length).toFixed(2)
            : '0.00'
        }
      };
    } catch (error: any) {
      throw new Error(`getTotalContactsData error: ${error.message}`);
    }
  }

  /**
   * 7. ดึงข้อมูลจำนวนรอปิดการขาย (Pending Deals)
   */
  async getPendingDealsData(filters: {
    salespersonId?: string;
    year?: number;
    month?: number;
  }): Promise<any> {
    try {
      const rawData = await this.saleDashboardRepo.getPendingDealsData(filters);
      
      // Format data for frontend
      const formattedData = rawData.map((item: any) => ({
        saleId: item.sale_id,
        saleName: item.sale_name,
        totalPending: parseInt(item.total_pending || 0),
        quotePending: parseInt(item.quote_pending || 0),
        financialPending: parseInt(item.financial_pending || 0),
        inProgressPending: parseInt(item.in_progress_pending || 0),
        totalPendingValue: parseFloat(item.total_pending_value || 0),
        avgPendingValue: item.total_pending > 0 
          ? (parseFloat(item.total_pending_value || 0) / parseInt(item.total_pending || 0)).toFixed(2)
          : '0.00'
      }));

      return {
        data: formattedData,
        summary: {
          totalPendingDeals: formattedData.reduce((sum: number, item: any) => sum + item.totalPending, 0),
          totalPendingValue: formattedData.reduce((sum: number, item: any) => sum + item.totalPendingValue, 0),
          avgDealValue: formattedData.length > 0 
            ? (formattedData.reduce((sum: number, item: any) => sum + item.totalPendingValue, 0) / formattedData.reduce((sum: number, item: any) => sum + item.totalPending, 0)).toFixed(2)
            : '0.00'
        }
      };
    } catch (error: any) {
      throw new Error(`getPendingDealsData error: ${error.message}`);
    }
  }

  /**
   * 8. ดึงข้อมูลยอดขายเซลล์ (Sales Chart) รายเดือน
   */
  async getSalesChartData(filters: {
    salespersonId?: string;
    year?: number;
  }): Promise<any> {
    try {
      const rawData = await this.saleDashboardRepo.getSalesChartData(filters);
      
      // Format data for Nivo Line Chart
      const salesBySalesperson = this.groupDataBySalesperson(rawData);
      const chartData = Object.keys(salesBySalesperson).map((saleId, index) => {
        const saleData = salesBySalesperson[saleId];
        const monthlyData = this.fillMissingMonths(saleData);
        
        return {
          id: saleData[0]?.sale_name || `Sale ${saleId}`,
          color: this.getChartColor(index),
          data: monthlyData.map((month: any) => ({
            x: this.getMonthName(month.month_number),
            y: parseFloat(month.total_revenue || 0)
          }))
        };
      });

      return {
        chartData,
        summary: this.calculateSalesSummary(rawData)
      };
    } catch (error: any) {
      throw new Error(`getSalesChartData error: ${error.message}`);
    }
  }

  /**
   * 9. ดึงข้อมูลยอด Shipment ของเซลล์ (Shipment Chart) รายเดือน
   * รองรับ Line Chart พร้อม Filter ตาม Salesperson, ปี, เดือน
   */
  async getShipmentChartData(filters: {
    salespersonId?: string;
    year?: number;
    startMonth?: number;
    endMonth?: number;
  }): Promise<any> {
    try {
      const rawData = await this.saleDashboardRepo.getShipmentChartData(filters);
      
      // Determine month range
      const startMonth = filters.startMonth || 1;
      const endMonth = filters.endMonth || 12;
      const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                         'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      
      // Filter months based on range
      const selectedMonths = monthNames.slice(startMonth - 1, endMonth);
      
      // Group by job type combination
      const shipmentByJobType = this.groupShipmentByJobType(rawData);
      console.log("shipmentByJobType:", shipmentByJobType);
      
      // Create line chart data structure
      const lineChartData = Object.keys(shipmentByJobType).map((jobType, index) => {
        const jobData = shipmentByJobType[jobType];
        
        // Create monthly data for selected range
        const monthlyData = selectedMonths.map((monthName, monthIndex) => {
          const monthNumber = startMonth + monthIndex;
          const monthData = jobData.filter(item => item.month_number === monthNumber);
          const totalShipments = monthData.reduce((sum, item) => sum + parseInt(item.shipment_count || 0), 0);
          const totalValue = monthData.reduce((sum, item) => sum + parseFloat(item.shipment_value || 0), 0);
          
          return {
            x: monthName,
            y: totalShipments,
            value: totalValue
          };
        });
        
        return {
          id: this.formatJobTypeName(jobType),
          color: this.getChartColor(index),
          data: monthlyData
        };
      });

      // Calculate summary statistics
      const summary = this.calculateShipmentSummary(rawData);
      
      // Get available salespersons for filter dropdown
      const availableSalespersons = [...new Set(rawData.map((item: any) => ({
        id: item.sale_id,
        name: item.sale_name
      })))];

      console.log("Final lineChartData:", lineChartData);

      return {
        success: true,
        data: {
          chartType: 'line',
          chartData: lineChartData,
          summary,
          filters: {
            selectedSalesperson: filters.salespersonId || 'all',
            selectedYear: filters.year || new Date().getFullYear(),
            monthRange: { start: startMonth, end: endMonth },
            availableSalespersons
          },
          metadata: {
            totalJobTypes: lineChartData.length,
            dataPoints: lineChartData.reduce((sum, line) => sum + line.data.length, 0),
            period: `${monthNames[startMonth - 1]} - ${monthNames[endMonth - 1]} ${filters.year || new Date().getFullYear()}`
          }
        }
      };
    } catch (error: any) {
      throw new Error(`getShipmentChartData error: ${error.message}`);
    }
  }



  private getChartColor(index: number): string {
    const colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    return colors[index % colors.length];
  }

  /**
   * Format Job Type Monthly Trend Data for Nivo Line Chart
   */
  private formatJobTypeMonthlyTrend(rawData: any[]): any {
    // Group data by job_type_combination
    const groupedData: { [key: string]: any[] } = {};
    const jobTypeSummary: { [key: string]: { total: number; avgValue: number; months: number } } = {};
    
    rawData.forEach(row => {
      const jobType = row.job_type_combination;
      
      if (!groupedData[jobType]) {
        groupedData[jobType] = [];
        jobTypeSummary[jobType] = { total: 0, avgValue: 0, months: 0 };
      }
      
      groupedData[jobType].push({
        x: this.getMonthName(row.month_number),
        y: parseInt(row.job_count)
      });
      
      jobTypeSummary[jobType].total += parseInt(row.job_count);
      jobTypeSummary[jobType].avgValue += parseFloat(row.avg_job_value || 0);
      jobTypeSummary[jobType].months += 1;
    });
    
    // Format for Nivo Line Chart
    const chartData = Object.keys(groupedData).map((jobType, index) => {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
      
      // Ensure all 12 months are present
      const monthlyData = this.fillMissingMonths(groupedData[jobType]);
      
      return {
        id: this.formatJobTypeName(jobType),
        color: colors[index % colors.length],
        data: monthlyData
      };
    });
    
    // Calculate summary statistics
    Object.keys(jobTypeSummary).forEach(jobType => {
      if (jobTypeSummary[jobType].months > 0) {
        jobTypeSummary[jobType].avgValue = jobTypeSummary[jobType].avgValue / jobTypeSummary[jobType].months;
      }
    });
    
    return {
      chartData,
      summary: jobTypeSummary,
      jobTypes: Object.keys(groupedData).map(jobType => this.formatJobTypeName(jobType))
    };
  }
  
  /**
   * Format Monthly Data for Charts
   */
  private formatMonthlyData(rawData: any[]): any {
    // Basic formatting for monthly analysis
    const monthlyBreakdown = rawData.map(row => ({
      month: this.getMonthName(row.month_number),
      jobs: parseInt(row.job_count || 0),
      revenue: parseFloat(row.total_revenue || 0)
    }));
    
    const yearlyTotals = {
      totalJobs: monthlyBreakdown.reduce((sum, month) => sum + month.jobs, 0),
      totalRevenue: monthlyBreakdown.reduce((sum, month) => sum + month.revenue, 0)
    };
    
    return {
      monthlyBreakdown,
      yearlyTotals,
      trends: this.calculateTrends(monthlyBreakdown)
    };
  }
  
  /**
   * Helper: Get month name from number
   */
  private getMonthName(monthNumber: number): string {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                   'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return months[monthNumber - 1] || 'Unknown';
  }
  
  /**
   * Helper: Format job type name for display
   */
  private formatJobTypeName(jobType: string): string {
    // Split by '-' and filter out empty parts, then rejoin with ' | '
    const parts = jobType.split('-').filter(part => part.trim() !== '');
    return parts.join(' | ');
  }
  
  /**
   * Helper: Fill missing months with 0 values
   */
  private fillMissingMonths(data: any[]): any[] {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                   'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    
    const result = months.map(month => {
      const existing = data.find(d => d.x === month);
      return existing || { x: month, y: 0 };
    });
    
    return result;
  }
  
  /**
   * Helper: คำนวณ Trends (เพิ่มขึ้น, ลดลง, คงที่)
   */
  private calculateTrends(data: any[]): any {
    if (data.length < 2) return { trend: 'stable', change: 0 };
    
    const values = data.map(d => d.y);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    return {
      trend: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      change: parseFloat(change.toFixed(2))
    };
  }

  /**
   * Helper: จัดกลุ่มข้อมูลตาม Salesperson
   */
  private groupDataBySalesperson(data: any[]): { [key: string]: any[] } {
    return data.reduce((groups, item) => {
      const saleId = item.sale_id;
      if (!groups[saleId]) {
        groups[saleId] = [];
      }
      groups[saleId].push(item);
      return groups;
    }, {});
  }

  /**
   * Helper: จัดกลุ่ม Shipment ตาม Job Type Combination
   */
  private groupShipmentByJobType(data: any[]): { [key: string]: any[] } {
    return data.reduce((groups, item) => {
      const jobType = item.job_type_combination;
      if (!groups[jobType]) {
        groups[jobType] = [];
      }
      groups[jobType].push(item);
      return groups;
    }, {});
  }

  /**
   * Helper: คำนวณ Sales Summary
   */
  private calculateSalesSummary(data: any[]): any {
    const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0);
    const totalJobs = data.reduce((sum, item) => sum + parseInt(item.jobs_count || 0), 0);
    const totalClosed = data.reduce((sum, item) => sum + parseInt(item.closed_jobs || 0), 0);
    
    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalJobs,
      totalClosed,
      avgJobValue: totalJobs > 0 ? (totalRevenue / totalJobs).toFixed(2) : '0.00',
      closingRate: totalJobs > 0 ? ((totalClosed / totalJobs) * 100).toFixed(2) : '0.00'
    };
  }

  /**
   * Helper: คำนวณ Shipment Summary
   */
  private calculateShipmentSummary(data: any[]): any {
    const totalShipments = data.reduce((sum, item) => sum + parseInt(item.shipment_count || 0), 0);
    const totalValue = data.reduce((sum, item) => sum + parseFloat(item.shipment_value || 0), 0);
    const jobTypes = [...new Set(data.map(item => item.job_type_combination))];
    
    return {
      totalShipments,
      totalValue: totalValue.toFixed(2),
      avgShipmentValue: totalShipments > 0 ? (totalValue / totalShipments).toFixed(2) : '0.00',
      uniqueJobTypes: jobTypes.length,
      topJobType: jobTypes.length > 0 ? this.formatJobTypeName(jobTypes[0]) : 'N/A'
    };
  }

  /**
   * Helper Methods
   */

  /**
   * Parse date range based on preset or custom dates
   */
  private parseDateRange(
    dateRange?: 'week' | 'month' | 'quarter' | 'year', 
    startDate?: string, 
    endDate?: string
  ): { current: { startDate: Date; endDate: Date }; previous: { startDate: Date; endDate: Date } } {
    const now = moment();
    let currentStart: moment.Moment;
    let currentEnd: moment.Moment;

    if (startDate && endDate) {
      currentStart = moment(startDate);
      currentEnd = moment(endDate);
    } else {
      switch (dateRange) {
        case 'week':
          currentStart = now.clone().startOf('week');
          currentEnd = now.clone().endOf('week');
          break;
        case 'month':
          currentStart = now.clone().startOf('month');
          currentEnd = now.clone().endOf('month');
          break;
        case 'quarter':
          currentStart = now.clone().startOf('quarter');
          currentEnd = now.clone().endOf('quarter');
          break;
        case 'year':
          currentStart = now.clone().startOf('year');
          currentEnd = now.clone().endOf('year');
          break;
        default:
          currentStart = now.clone().startOf('month');
          currentEnd = now.clone().endOf('month');
      }
    }

    // Calculate previous period (same duration)
    const duration = currentEnd.diff(currentStart);
    const previousEnd = currentStart.clone().subtract(1, 'day');
    const previousStart = previousEnd.clone().subtract(duration);

    return {
      current: {
        startDate: currentStart.toDate(),
        endDate: currentEnd.toDate(),
      },
      previous: {
        startDate: previousStart.toDate(),
        endDate: previousEnd.toDate(),
      },
    };
  }

  /**
   * Get date range label for display
   */
  private getDateRangeLabel(dateRange?: 'week' | 'month' | 'quarter' | 'year'): string {
    const labels: { [key: string]: string } = {
      week: 'This Week',
      month: 'This Month',
      quarter: 'This Quarter',
      year: 'This Year',
    };
    return labels[dateRange || 'month'] || 'This Month';
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M THB`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K THB`;
    }
    return `${amount.toLocaleString()} THB`;
  }

  /**
   * Transform revenue data for Chart.js format
   */
  private transformRevenueDataForChart(data: any[]): any {
    // Group by period and create datasets for each job type
    const periods = [...new Set(data.map((item: any) => item.period))].sort();
    
    const routeTypes = ['import', 'export'];
    const transportTypes = ['SEA', 'AIR', 'EK', 'RE'];
    
    const datasets = [
      ...routeTypes.map(route => ({
        label: `${route.charAt(0).toUpperCase() + route.slice(1)} Revenue`,
        data: periods.map(period => {
          const item = data.find((d: any) => d.period === period && d.d_route === route);
          return item ? parseFloat(item.total_revenue) : 0;
        }),
        borderColor: route === 'import' ? '#4CAF50' : '#2196F3',
        backgroundColor: route === 'import' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
      })),
      ...transportTypes.map(transport => ({
        label: `${transport} Transport`,
        data: periods.map(period => {
          const item = data.find((d: any) => d.period === period && d.d_transport === transport);
          return item ? parseFloat(item.total_revenue) : 0;
        }),
        borderColor: {
          SEA: '#FF9800',
          AIR: '#9C27B0',
          EK: '#607D8B',
          RE: '#795548',
        }[transport],
        backgroundColor: {
          SEA: 'rgba(255, 152, 0, 0.1)',
          AIR: 'rgba(156, 39, 176, 0.1)',
          EK: 'rgba(96, 125, 139, 0.1)',
          RE: 'rgba(121, 85, 72, 0.1)',
        }[transport],
        tension: 0.4,
      })),
    ];

    return {
      labels: periods,
      datasets,
    };
  }

  /**
   * Transform job volume data for Chart.js format
   */
  private transformJobVolumeDataForChart(data: any[]): any {
    const labels = data.map((item: any) => item.sale_name);
    
    const datasets = [
      {
        label: 'Import Jobs',
        data: data.map((item: any) => parseInt(item.import_jobs)),
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        borderWidth: 1,
      },
      {
        label: 'Export Jobs',
        data: data.map((item: any) => parseInt(item.export_jobs)),
        backgroundColor: '#2196F3',
        borderColor: '#1976D2',
        borderWidth: 1,
      },
      {
        label: 'SEA Transport',
        data: data.map((item: any) => parseInt(item.sea_jobs)),
        backgroundColor: '#FF9800',
        borderColor: '#F57C00',
        borderWidth: 1,
      },
      {
        label: 'AIR Transport',
        data: data.map((item: any) => parseInt(item.air_jobs)),
        backgroundColor: '#9C27B0',
        borderColor: '#7B1FA2',
        borderWidth: 1,
      },
      {
        label: 'ALL IN Jobs',
        data: data.map((item: any) => parseInt(item.all_in_jobs)),
        backgroundColor: '#607D8B',
        borderColor: '#455A64',
        borderWidth: 1,
      },
      {
        label: 'CIF Jobs',
        data: data.map((item: any) => parseInt(item.cif_jobs)),
        backgroundColor: '#795548',
        borderColor: '#5D4037',
        borderWidth: 1,
      },
    ];

    return {
      labels,
      datasets,
    };
  }

  /**
   * Transform monthly data for Chart.js format
   */
  private transformMonthlyDataForChart(data: any[]): any {
    // Group by month
    const monthlyGroups = data.reduce((acc: any, item: any) => {
      const month = item.month_period;
      if (!acc[month]) {
        acc[month] = {
          month,
          jobs_count: 0,
          total_revenue: 0,
          avg_job_value: 0,
        };
      }
      acc[month].jobs_count += parseInt(item.jobs_count);
      acc[month].total_revenue += parseFloat(item.total_revenue);
      acc[month].avg_job_value = acc[month].total_revenue / acc[month].jobs_count;
      return acc;
    }, {});

    const monthlyData = Object.values(monthlyGroups).sort((a: any, b: any) => 
      a.month.localeCompare(b.month)
    );

    const labels = monthlyData.map((item: any) => item.month);

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Job Count',
          data: monthlyData.map((item: any) => item.jobs_count),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: 'Revenue (Million THB)',
          data: monthlyData.map((item: any) => item.total_revenue / 1000000),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
        },
        {
          type: 'line',
          label: 'Avg Job Value (K THB)',
          data: monthlyData.map((item: any) => item.avg_job_value / 1000),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
          yAxisID: 'y2',
        },
      ],
    };
  }

  /**
   * Calculate year-over-year growth
   */
  private calculateYearOverYearGrowth(currentYear: any[], previousYear: any[]): any {
    if (!previousYear.length) return null;

    const currentTotal = currentYear.reduce((sum: any, item: any) => sum + parseFloat(item.total_revenue), 0);
    const previousTotal = previousYear.reduce((sum: any, item: any) => sum + parseFloat(item.total_revenue), 0);

    const revenueGrowth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    const currentJobs = currentYear.reduce((sum: any, item: any) => sum + parseInt(item.jobs_count), 0);
    const previousJobs = previousYear.reduce((sum: any, item: any) => sum + parseInt(item.jobs_count), 0);

    const jobGrowth = previousJobs > 0 ? ((currentJobs - previousJobs) / previousJobs) * 100 : 0;

    return {
      revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      jobGrowth: parseFloat(jobGrowth.toFixed(2)),
      currentYear: {
        revenue: currentTotal,
        jobs: currentJobs,
      },
      previousYear: {
        revenue: previousTotal,
        jobs: previousJobs,
      },
    };
  }

  /**
   * 9. ดึงรายชื่อเซลส์ที่มีอยู่ในระบบ
   */
  async getAvailableSalespersons(): Promise<any> {
    try {
      const salespersons = await this.saleDashboardRepo.getAvailableSalespersons();
      return {
        success: true,
        data: salespersons.map((person: any) => ({
          id: person.id,
          name: person.fullname || person.email,
          fullName: person.fullname,
          role: person.roles_name
        })),
        count: salespersons.length
      };
    } catch (error) {
      console.error('Error in getAvailableSalespersons:', error);
      throw error;
    }
  }
}

export default SaleDashboardService;
