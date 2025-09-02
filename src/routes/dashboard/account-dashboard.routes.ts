import { Router } from 'express';
import AccountDashboardService from '../../services/dashboard/account-dashboard.service';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /dashboard/account/kpis - ดึงข้อมูล KPIs หลัก
router.get('/kpis', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const kpis = await AccountDashboardService.getAccountKPIs(filters);
    
    res.json({
      success: true,
      data: kpis
    });
  } catch (error) {
    console.error('Error fetching account KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account KPIs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/shipping - ดึงข้อมูล Shipping Metrics
router.get('/shipping', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const shippingMetrics = await AccountDashboardService.getShippingMetrics(filters);
    
    res.json({
      success: true,
      data: shippingMetrics
    });
  } catch (error) {
    console.error('Error fetching shipping metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipping metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/revenue - ดึงข้อมูล Revenue Metrics
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const revenueMetrics = await AccountDashboardService.getRevenueMetrics(filters);
    
    res.json({
      success: true,
      data: revenueMetrics
    });
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/costs - ดึงข้อมูล Cost Metrics
router.get('/costs', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const costMetrics = await AccountDashboardService.getCostMetrics(filters);
    
    res.json({
      success: true,
      data: costMetrics
    });
  } catch (error) {
    console.error('Error fetching cost metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cost metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/monthly - ดึงข้อมูลรายรับ-รายจ่าย รายเดือน
router.get('/monthly', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const monthlyData = await AccountDashboardService.getMonthlyRevenueExpense(filters);
    
    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/transactions - ดึงข้อมูลการวิเคราะห์ธุรกรรม
router.get('/transactions', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const transactionAnalysis = await AccountDashboardService.getTransactionAnalysis(filters);
    
    res.json({
      success: true,
      data: transactionAnalysis
    });
  } catch (error) {
    console.error('Error fetching transaction analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction analysis',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/customers - ดึงข้อมูลลูกค้า Top 5
router.get('/customers', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const topCustomers = await AccountDashboardService.getTopCustomers(filters);
    
    res.json({
      success: true,
      data: topCustomers
    });
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top customers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/proportions/revenue - ดึงข้อมูลสัดส่วนรายรับ
router.get('/proportions/revenue', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const revenueProportions = await AccountDashboardService.getRevenueProportions(filters);
    
    res.json({
      success: true,
      data: revenueProportions
    });
  } catch (error) {
    console.error('Error fetching revenue proportions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue proportions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/proportions/expense - ดึงข้อมูลสัดส่วนรายจ่าย
router.get('/proportions/expense', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const expenseProportions = await AccountDashboardService.getExpenseProportions(filters);
    
    res.json({
      success: true,
      data: expenseProportions
    });
  } catch (error) {
    console.error('Error fetching expense proportions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense proportions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/charts/revenue-pie - ดึงข้อมูลกราฟ Pie Chart รายรับ
router.get('/charts/revenue-pie', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const pieChartData = await AccountDashboardService.getRevenuePieChartData(filters);
    
    res.json({
      success: true,
      data: pieChartData
    });
  } catch (error) {
    console.error('Error fetching revenue pie chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue pie chart data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/charts/expense-pie - ดึงข้อมูลกราฟ Pie Chart รายจ่าย
router.get('/charts/expense-pie', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const pieChartData = await AccountDashboardService.getExpensePieChartData(filters);
    
    res.json({
      success: true,
      data: pieChartData
    });
  } catch (error) {
    console.error('Error fetching expense pie chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense pie chart data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/charts/transaction-bar - ดึงข้อมูลกราฟ Bar Chart ธุรกรรม
router.get('/charts/transaction-bar', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const barChartData = await AccountDashboardService.getTransactionBarChartData(filters);
    
    res.json({
      success: true,
      data: barChartData
    });
  } catch (error) {
    console.error('Error fetching transaction bar chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction bar chart data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/charts/revenue-expense-comparison - ดึงข้อมูลกราฟเปรียบเทียบรายรับ-รายจ่าย
router.get('/charts/revenue-expense-comparison', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const comparisonData = await AccountDashboardService.getRevenueExpenseComparison(filters);
    
    res.json({
      success: true,
      data: comparisonData
    });
  } catch (error) {
    console.error('Error fetching revenue expense comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue expense comparison',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /dashboard/account/complete - ดึงข้อมูล Dashboard แบบครบชุด
router.get('/complete', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      period: (period as 'day' | 'month' | 'year') || 'month'
    };

    const completeData = await AccountDashboardService.getCompleteAccountDashboard(filters);
    
    res.json({
      success: true,
      data: completeData
    });
  } catch (error) {
    console.error('Error fetching complete account dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complete account dashboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
