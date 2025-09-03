import AccountDashboardRepository, { 
  AccountFilters, 
  ShippingMetrics, 
  RevenueMetrics, 
  CostMetrics,
  MonthlyRevenueExpense,
  CustomerRanking,
  TransactionAnalysis,
  RevenueProportions,
  ExpenseProportions
} from '../../repository/dashboard/account-dashboard.repository';

export interface CompleteAccountDashboardData {
  shippingMetrics: ShippingMetrics;
  revenueMetrics: RevenueMetrics;
  costMetrics: CostMetrics;
  monthlyData: MonthlyRevenueExpense[];
  transactionAnalysis: TransactionAnalysis;
  topCustomers: CustomerRanking[];
  revenueProportions: RevenueProportions;
  expenseProportions: ExpenseProportions[];
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

export interface AccountKPIs {
  pendingShipments: number;
  totalWithdrawalAmount: number;
  totalClearedAmount: number;
  remainingBalance: number;
  totalRevenue: number;
  revenueBeforeVat: number;
  costOfSales: number;
  totalAllExpenses: number;
  costPercentage: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

class AccountDashboardService {
  // ดึงข้อมูล KPIs หลักทั้งหมด
  async getAccountKPIs(filters: AccountFilters): Promise<AccountKPIs> {
    const [shippingMetrics, revenueMetrics, costMetrics] = await Promise.all([
      AccountDashboardRepository.getShippingMetrics(filters),
      AccountDashboardRepository.getRevenueMetrics(filters),
      AccountDashboardRepository.getCostMetrics(filters)
    ]);

    const grossProfit = revenueMetrics.totalRevenue - costMetrics.costOfSales;
    const netProfit = grossProfit; // ยังไม่มีค่าใช้จ่ายอื่น
    const profitMargin = revenueMetrics.totalRevenue > 0 ? 
      (netProfit / revenueMetrics.totalRevenue) * 100 : 0;

    return {
      pendingShipments: shippingMetrics.pendingShipments,
      totalWithdrawalAmount: shippingMetrics.totalWithdrawalAmount,
      totalClearedAmount: shippingMetrics.totalClearedAmount,
      remainingBalance: shippingMetrics.remainingBalance,
      totalRevenue: revenueMetrics.totalRevenue,
      revenueBeforeVat: revenueMetrics.revenueBeforeVat,
      costOfSales: costMetrics.costOfSales,
      totalAllExpenses: costMetrics.totalAllExpenses,
      costPercentage: costMetrics.costPercentage,
      grossProfit: Number(grossProfit.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(2))
    };
  }

  // ดึงข้อมูล Shipping Metrics
  async getShippingMetrics(filters: AccountFilters): Promise<ShippingMetrics> {
    return await AccountDashboardRepository.getShippingMetrics(filters);
  }

  // ดึงข้อมูล Revenue Metrics
  async getRevenueMetrics(filters: AccountFilters): Promise<RevenueMetrics> {
    return await AccountDashboardRepository.getRevenueMetrics(filters);
  }

  // ดึงข้อมูล Cost Metrics
  async getCostMetrics(filters: AccountFilters): Promise<CostMetrics> {
    return await AccountDashboardRepository.getCostMetrics(filters);
  }

  // ดึงข้อมูลรายรับ-รายจ่าย รายเดือน
  async getMonthlyRevenueExpense(filters: AccountFilters): Promise<MonthlyRevenueExpense[]> {
    const monthlyData = await AccountDashboardRepository.getMonthlyRevenueExpense(filters);
    
    // เพิ่มการคำนวณต้นทุนรายเดือน (ถ้ามีข้อมูล)
    return monthlyData.map(item => ({
      ...item,
      grossProfit: item.totalRevenue - item.totalCost,
      netProfit: item.totalRevenue - item.totalCost
    }));
  }

  // ดึงข้อมูลการวิเคราะห์ธุรกรรม (ฝาก/โอน)
  async getTransactionAnalysis(filters: AccountFilters): Promise<TransactionAnalysis> {
    return await AccountDashboardRepository.getTransactionAnalysis(filters);
  }

  // ดึงข้อมูลลูกค้า Top 5
  async getTopCustomers(filters: AccountFilters): Promise<CustomerRanking[]> {
    return await AccountDashboardRepository.getTopCustomers(filters);
  }

  // ดึงข้อมูลสัดส่วนรายรับ
  async getRevenueProportions(filters: AccountFilters): Promise<RevenueProportions> {
    return await AccountDashboardRepository.getRevenueProportions(filters);
  }

  // ดึงข้อมูลสัดส่วนรายจ่าย
  async getExpenseProportions(filters: AccountFilters): Promise<ExpenseProportions[]> {
    return await AccountDashboardRepository.getExpenseProportions(filters);
  }

  // ดึงข้อมูล Dashboard แบบครบชุด
  async getCompleteAccountDashboard(filters: AccountFilters): Promise<CompleteAccountDashboardData> {
    const [
      shippingMetrics,
      revenueMetrics,
      costMetrics,
      monthlyData,
      transactionAnalysis,
      topCustomers,
      revenueProportions,
      expenseProportions
    ] = await Promise.all([
      this.getShippingMetrics(filters),
      this.getRevenueMetrics(filters),
      this.getCostMetrics(filters),
      this.getMonthlyRevenueExpense(filters),
      this.getTransactionAnalysis(filters),
      this.getTopCustomers(filters),
      this.getRevenueProportions(filters),
      this.getExpenseProportions(filters)
    ]);

    const grossProfit = revenueMetrics.revenueBeforeVat - costMetrics.costOfSales;
    const netProfit = grossProfit; // ยังไม่มีค่าใช้จ่ายอื่น
    const profitMargin = revenueMetrics.revenueBeforeVat > 0 ? 
      (netProfit / revenueMetrics.revenueBeforeVat) * 100 : 0;

    return {
      shippingMetrics,
      revenueMetrics,
      costMetrics,
      monthlyData,
      transactionAnalysis,
      topCustomers,
      revenueProportions,
      expenseProportions,
      grossProfit: Number(grossProfit.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(2))
    };
  }

  // ดึงข้อมูลสำหรับกราฟเปรียบเทียบรายรับ-รายจ่าย
  async getRevenueExpenseComparison(filters: AccountFilters) {
    const monthlyData = await this.getMonthlyRevenueExpense(filters);

    return monthlyData.map(item => ({
      month: item.month,
      revenue: item.totalRevenue,
      expense: item.totalCost,
      profit: item.grossProfit,
      profitMargin: item.totalRevenue > 0 ? (item.grossProfit / item.totalRevenue) * 100 : 0
    }));
  }

  // ดึงข้อมูลสำหรับกราฟ Pie Chart รายรับ
  async getRevenuePieChartData(filters: AccountFilters) {
    const proportions = await this.getRevenueProportions(filters);
    
    return [
      {
        id: 'deposit',
        label: 'รายรับฝากชำระ',
        value: proportions.depositRevenue,
        percentage: proportions.depositPercentage
      },
      {
        id: 'exchange',
        label: 'รายรับแลกเปลี่ยน',
        value: proportions.exchangeRevenue,
        percentage: proportions.exchangePercentage
      }
    ];
  }

  // ดึงข้อมูลสำหรับกราฟ Pie Chart รายจ่าย
  async getExpensePieChartData(filters: AccountFilters) {
    const proportions = await this.getExpenseProportions(filters);
    
    return proportions.map(item => ({
      id: item.category.toLowerCase().replace(/\s+/g, '_'),
      label: item.category,
      value: item.amount,
      percentage: item.percentage
    }));
  }

  // ดึงข้อมูลสำหรับกราฟ Bar Chart ธุรกรรม
  async getTransactionBarChartData(filters: AccountFilters) {
    const analysis = await this.getTransactionAnalysis(filters);
    
    return [
      {
        type: 'ฝากชำระ',
        RMB: analysis.depositAmountRMB,
        THB: analysis.depositAmountTHB
      },
      {
        type: 'แลกเปลี่ยน',
        RMB: analysis.transferAmountRMB,
        THB: analysis.transferAmountTHB
      }
    ];
  }
}

export default new AccountDashboardService();
