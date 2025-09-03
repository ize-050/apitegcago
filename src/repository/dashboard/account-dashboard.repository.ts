import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface AccountFilters {
  startDate?: string;
  endDate?: string;
}

export interface ShippingMetrics {
  pendingShipments: number;
  totalWithdrawalAmount: number;
  totalClearedAmount: number;
  remainingBalance: number;
}

export interface RevenueMetrics {
  totalDepositRevenue: number;
  totalExchangeRevenue: number;
  totalRevenue: number;
  revenueBeforeVat: number;
}

export interface CostMetrics {
  totalPurchaseCost: number;
  totalVatAmount: number;
  costOfSales: number;
  totalShippingCost: number;
  totalChinaExpenses: number;
  totalThailandExpenses: number;
  totalAllExpenses: number;
  costPercentage: number;
  expenseBreakdown: {
    employeeCost: number;
    warehouseCost: number;
    customsCost: number;
    portFees: number;
    otherExpenses: number;
  };
}

export interface MonthlyRevenueExpense {
  month: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  netProfit: number;
}

export interface TransactionAnalysis {
  totalDepositTransactions: number;
  totalTransferTransactions: number;
  depositAmountRMB: number;
  depositAmountTHB: number;
  transferAmountRMB: number;
  transferAmountTHB: number;
  totalTransactionRMB: number;
  totalTransactionTHB: number;
}

export interface CustomerRanking {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalBillingAmount: number;
  totalAmount: number;
  transactionCount: number;
}

export interface RevenueProportions {
  depositRevenue: number;
  exchangeRevenue: number;
  depositPercentage: number;
  exchangePercentage: number;
}

export interface ExpenseProportions {
  category: string;
  amount: number;
  percentage: number;
}

export class AccountDashboardRepository {
  // 1. Shipping Metrics
  async getShippingMetrics(filters: AccountFilters): Promise<ShippingMetrics> {
    // จำนวนงานที่รอจัดส่ง
    const pendingShipments = await prisma.$queryRaw<Array<{
      count: number;
    }>>`
      SELECT COUNT(*) as count
      FROM d_purchase dp
      WHERE dp.deletedAt IS NULL
        AND dp.d_status != 'completed'
        ${filters.startDate && filters.endDate ? 
          Prisma.sql`AND dp.createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : 
          Prisma.empty}
    `;

    // ยอดเบิกทั้งหมด (จาก withdrawalInformaion)
    const totalWithdrawal = await prisma.$queryRaw<Array<{ total_amount: number }>>`
      SELECT COALESCE(SUM(CAST(pay_total as DECIMAL(15,2))), 0) as total_amount
      FROM withdrawalInformaion 
      WHERE deletedAt IS NULL
        ${filters.startDate && filters.endDate ? 
          Prisma.sql`AND createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : 
          Prisma.empty}
    `;

    // จำนวนเงินรวมเคลียร์ (จาก shipping advance ใน purchase_finance_shipping)
    const totalClearedAmount = await prisma.$queryRaw<Array<{
      cleared_amount: number;
    }>>`
      SELECT COALESCE(SUM(CAST(pfs.th_shipping_advance as DECIMAL(15,2))), 0) as cleared_amount
      FROM purchase_finance_shipping pfs
      JOIN purchase_finance pf ON pfs.purchase_finance_id = pf.id
      JOIN d_purchase dp ON pf.d_purchase_id = dp.id
      WHERE pfs.deletedAt IS NULL 
        AND pf.deletedAt IS NULL
        AND dp.deletedAt IS NULL
        ${filters.startDate && filters.endDate ? 
          Prisma.sql`AND dp.createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : 
          Prisma.empty}
    `;

    const totalWithdrawalAmount = Number(totalWithdrawal[0]?.total_amount) || 0;
    const clearedAmount = Number(totalClearedAmount[0]?.cleared_amount) || 0;

    return {
      pendingShipments: Number(pendingShipments[0]?.count) || 0,
      totalWithdrawalAmount: totalWithdrawalAmount,
      totalClearedAmount: clearedAmount,
      remainingBalance: totalWithdrawalAmount - clearedAmount
    };
  }

  // 2. Revenue Metrics
  async getRevenueMetrics(filters: AccountFilters): Promise<RevenueMetrics> {
    // รายรับหลักจาก purchase_finance (ยอดเรียกเก็บก่อน VAT)
    const purchaseRevenue = await prisma.$queryRaw<Array<{ total_revenue: number }>>`
      SELECT COALESCE(SUM(CAST(pf.total_before_vat as DECIMAL(15,2))), 0) as total_revenue
      FROM purchase_finance pf
      JOIN d_purchase dp ON pf.d_purchase_id = dp.id
      WHERE pf.deletedAt IS NULL 
        AND dp.deletedAt IS NULL
        ${filters.startDate && filters.endDate ? Prisma.sql`AND dp.createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : Prisma.empty}
    `;

    // รายรับจากฝากชำระ (ค่าธรรมเนียม)
    const depositRevenue = await prisma.$queryRaw<Array<{ total_revenue: number }>>`
      SELECT COALESCE(SUM(fee), 0) as total_revenue
      FROM finance_customer_deposit 
      WHERE deletedAt IS NULL
        ${filters.startDate && filters.endDate ? Prisma.sql`AND createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : Prisma.empty}
    `;

    const purchaseRev = Number(purchaseRevenue[0]?.total_revenue) || 0;
    const depositRev = Number(depositRevenue[0]?.total_revenue) || 0;

    const totalRevenue = purchaseRev + depositRev;

    return {
      totalDepositRevenue: depositRev,
      totalExchangeRevenue: 0, // ไม่นับ finance_exchange เป็นรายได้
      totalRevenue: totalRevenue,
      revenueBeforeVat: purchaseRev // ยอดเรียกเก็บก่อน VAT จาก purchase_finance
    };
  }

  // 3. Cost Metrics
  async getCostMetrics(filters: AccountFilters): Promise<CostMetrics> {
    // ค่าใช้จ่ายไทย (Thailand Expenses)
    const thailandExpenses = await prisma.$queryRaw<Array<{
      th_overtime: number;
      th_employee: number;
      th_warehouse: number;
      th_gasoline: number;
      th_duty: number;
      th_custom_fees: number;
      th_tax: number;
      th_hairy: number;
      th_check_fee: number;
      th_product_account: number;
      th_license_fee: number;
      th_other_fee: number;
      th_port_fee: number;
      th_lift_on_off: number;
      th_ground_fee: number;
      th_port_other_fee: number;
      th_price_head_tractor: number;
      amount_payment_do: number;
      price_deposit: number;
    }>>`
      SELECT 
        COALESCE(SUM(CAST(pfth.th_overtime as DECIMAL(15,2))), 0) as th_overtime,
        COALESCE(SUM(CAST(pfth.th_employee as DECIMAL(15,2))), 0) as th_employee,
        COALESCE(SUM(CAST(pfth.th_warehouse as DECIMAL(15,2))), 0) as th_warehouse,
        COALESCE(SUM(CAST(pfth.th_gasoline as DECIMAL(15,2))), 0) as th_gasoline,
        COALESCE(SUM(CAST(pfth.th_duty as DECIMAL(15,2))), 0) as th_duty,
        COALESCE(SUM(CAST(pfth.th_custom_fees as DECIMAL(15,2))), 0) as th_custom_fees,
        COALESCE(SUM(CAST(pfth.th_tax as DECIMAL(15,2))), 0) as th_tax,
        COALESCE(SUM(CAST(pfth.th_hairy as DECIMAL(15,2))), 0) as th_hairy,
        COALESCE(SUM(CAST(pfth.th_check_fee as DECIMAL(15,2))), 0) as th_check_fee,
        COALESCE(SUM(CAST(pfth.th_product_account as DECIMAL(15,2))), 0) as th_product_account,
        COALESCE(SUM(CAST(pfth.th_license_fee as DECIMAL(15,2))), 0) as th_license_fee,
        COALESCE(SUM(CAST(pfth.th_other_fee as DECIMAL(15,2))), 0) as th_other_fee,
        COALESCE(SUM(CAST(pfth.th_port_fee as DECIMAL(15,2))), 0) as th_port_fee,
        COALESCE(SUM(CAST(pfth.th_lift_on_off as DECIMAL(15,2))), 0) as th_lift_on_off,
        COALESCE(SUM(CAST(pfth.th_ground_fee as DECIMAL(15,2))), 0) as th_ground_fee,
        COALESCE(SUM(CAST(pfth.th_port_other_fee as DECIMAL(15,2))), 0) as th_port_other_fee,
        COALESCE(SUM(CAST(pfth.th_price_head_tractor as DECIMAL(15,2))), 0) as th_price_head_tractor,
        COALESCE(SUM(CAST(pfth.amount_payment_do as DECIMAL(15,2))), 0) as amount_payment_do,
        COALESCE(SUM(CAST(pfth.price_deposit as DECIMAL(15,2))), 0) as price_deposit
      FROM purchase_finance_thailand_expenses pfth
      JOIN purchase_finance pf ON pfth.purchase_finance_id = pf.id
      JOIN d_purchase dp ON pf.d_purchase_id = dp.id
      WHERE pfth.deletedAt IS NULL 
        AND pf.deletedAt IS NULL
        AND dp.deletedAt IS NULL
        ${filters.startDate && filters.endDate ? Prisma.sql`AND dp.createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : Prisma.empty}
    `;

    // ค่าใช้จ่ายจีน (China Expenses)
    const chinaExpenses = await prisma.$queryRaw<Array<{
      ch_freight_total: number;
    }>>`
      SELECT 
        COALESCE(SUM(CAST(pfch.ch_freight_total as DECIMAL(15,2))), 0) as ch_freight_total
      FROM purchase_finance_china_expenses pfch
      JOIN purchase_finance pf ON pfch.purchase_finance_id = pf.id
      JOIN d_purchase dp ON pf.d_purchase_id = dp.id
      WHERE pfch.deletedAt IS NULL 
        AND pf.deletedAt IS NULL
        AND dp.deletedAt IS NULL
        ${filters.startDate && filters.endDate ? Prisma.sql`AND dp.createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : Prisma.empty}
    `;

    // ค่าขนส่ง (Shipping Costs)
    const shippingCosts = await prisma.$queryRaw<Array<{
      th_shipping_price: number;
    }>>`
      SELECT 
        COALESCE(SUM(CAST(pfs.th_shipping_price as DECIMAL(15,2))), 0) as th_shipping_price
      FROM purchase_finance_shipping pfs
      JOIN purchase_finance pf ON pfs.purchase_finance_id = pf.id
      JOIN d_purchase dp ON pf.d_purchase_id = dp.id
      WHERE pfs.deletedAt IS NULL 
        AND pf.deletedAt IS NULL
        AND dp.deletedAt IS NULL
        ${filters.startDate && filters.endDate ? Prisma.sql`AND dp.createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : Prisma.empty}
    `;

    // คำนวณต้นทุนรวม
    const thData = thailandExpenses[0] || {};
    const chData = chinaExpenses[0] || { ch_freight_total: 0 };
    const shippingData = shippingCosts[0] || { th_shipping_price: 0 };

    // ค่าใช้จ่ายไทยรวม
    const totalThailandExpenses = 
      Number(thData.th_overtime || 0) +
      Number(thData.th_employee || 0) +
      Number(thData.th_warehouse || 0) +
      Number(thData.th_gasoline || 0) +
      Number(thData.th_duty || 0) +
      Number(thData.th_custom_fees || 0) +
      Number(thData.th_tax || 0) +
      Number(thData.th_hairy || 0) +
      Number(thData.th_check_fee || 0) +
      Number(thData.th_product_account || 0) +
      Number(thData.th_license_fee || 0) +
      Number(thData.th_other_fee || 0) +
      Number(thData.th_port_fee || 0) +
      Number(thData.th_lift_on_off || 0) +
      Number(thData.th_ground_fee || 0) +
      Number(thData.th_port_other_fee || 0) +
      Number(thData.th_price_head_tractor || 0) +
      Number(thData.amount_payment_do || 0) +
      Number(thData.price_deposit || 0);

    // ค่าใช้จ่ายจีนรวม
    const totalChinaExpenses = Number(chData.ch_freight_total || 0);

    // ค่าขนส่งรวม
    const totalShippingCost = Number(shippingData.th_shipping_price || 0);

    // ต้นทุนขายรวม (ต้นทุนจริงที่เกิดขึ้น)
    const costOfSales = totalThailandExpenses + totalChinaExpenses ;

    return {
      totalPurchaseCost: costOfSales,
      totalVatAmount: 0, // VAT ไม่ใช่ต้นทุน แต่เป็นภาษีที่เก็บจากลูกค้า
      costOfSales: costOfSales,
      totalShippingCost: totalShippingCost,
      totalChinaExpenses: totalChinaExpenses,
      totalThailandExpenses: totalThailandExpenses,
      totalAllExpenses: costOfSales,
      costPercentage: 0,
      expenseBreakdown: {
        employeeCost: Number(thData.th_employee || 0),
        warehouseCost: Number(thData.th_warehouse || 0),
        customsCost: Number(thData.th_duty || 0) + Number(thData.th_custom_fees || 0),
        portFees: Number(thData.th_port_fee || 0) + Number(thData.th_lift_on_off || 0) + Number(thData.th_ground_fee || 0) + Number(thData.th_port_other_fee || 0),
        otherExpenses: Number(thData.th_other_fee || 0) + Number(thData.th_gasoline || 0) + Number(thData.th_overtime || 0)
      }
    };
  }

  // 4. Monthly Revenue Expense
  async getMonthlyRevenueExpense(filters: AccountFilters): Promise<MonthlyRevenueExpense[]> {
    // สร้าง array ของ 12 เดือนย้อนหลัง
    const months = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthName = date.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' });
      months.push({ key: monthKey, name: monthName });
    }

    // ดึงข้อมูลรายได้รายเดือนจาก purchase_finance และ finance_customer_deposit
    const monthlyRevenue = await prisma.$queryRaw<Array<{
      month: string;
      purchase_revenue: number;
      deposit_revenue: number;
    }>>`
      SELECT 
        month_year as month,
        COALESCE(SUM(purchase_revenue), 0) as purchase_revenue,
        COALESCE(SUM(deposit_revenue), 0) as deposit_revenue
      FROM (
        SELECT 
          DATE_FORMAT(dp.createdAt, '%Y-%m') as month_year,
          COALESCE(SUM(CAST(pf.total_before_vat as DECIMAL(15,2))), 0) as purchase_revenue,
          0 as deposit_revenue
        FROM purchase_finance pf
        JOIN d_purchase dp ON pf.d_purchase_id = dp.id
        WHERE pf.deletedAt IS NULL 
          AND dp.deletedAt IS NULL
          ${filters.startDate && filters.endDate ? 
            Prisma.sql`AND dp.createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : 
            Prisma.empty}
        GROUP BY DATE_FORMAT(dp.createdAt, '%Y-%m')
        
        UNION ALL
        
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month_year,
          0 as purchase_revenue,
          COALESCE(SUM(fee), 0) as deposit_revenue
        FROM finance_customer_deposit 
        WHERE deletedAt IS NULL
          ${filters.startDate && filters.endDate ? 
            Prisma.sql`AND createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : 
            Prisma.empty}
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ) combined
      GROUP BY month_year
      ORDER BY month_year DESC
    `;

    // ดึงข้อมูลต้นทุนรายเดือน
    const monthlyCosts = await prisma.$queryRaw<Array<{
      month: string;
      total_cost: number;
    }>>`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COALESCE(SUM(CAST(billing_amount AS DECIMAL(15,2)) + COALESCE(CAST(vat_amount AS DECIMAL(15,2)), 0)), 0) as total_cost
      FROM purchase_finance 
      WHERE deletedAt IS NULL
        ${filters.startDate && filters.endDate ? 
          Prisma.sql`AND createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : 
          Prisma.empty}
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `;

    // รวมข้อมูลรายได้และต้นทุนตามเดือน
    const monthlyMap = new Map<string, {
      depositRevenue: number;
      exchangeRevenue: number;
      totalCost: number;
    }>();

    // เพิ่มข้อมูลรายได้
    monthlyRevenue.forEach(item => {
      monthlyMap.set(item.month, {
        depositRevenue: Number(item.deposit_revenue) || 0,
        exchangeRevenue: Number(item.purchase_revenue) || 0, // ใช้ purchase_revenue แทน exchange_revenue
        totalCost: 0
      });
    });

    // เพิ่มข้อมูลต้นทุน
    monthlyCosts.forEach(item => {
      const existing = monthlyMap.get(item.month);
      if (existing) {
        existing.totalCost = Number(item.total_cost) || 0;
      } else {
        monthlyMap.set(item.month, {
          depositRevenue: 0,
          exchangeRevenue: 0,
          totalCost: Number(item.total_cost) || 0
        });
      }
    });

    // สร้างข้อมูลครบ 12 เดือนโดยใช้ชื่อเดือนภาษาไทย
    return months.map(monthInfo => {
      const data = monthlyMap.get(monthInfo.key) || {
        depositRevenue: 0,
        exchangeRevenue: 0,
        totalCost: 0
      };
      
      return {
        month: monthInfo.name, // ใช้ชื่อเดือนภาษาไทย เช่น "ม.ค. 2024"
        totalRevenue: data.depositRevenue + data.exchangeRevenue,
        totalCost: data.totalCost,
        grossProfit: (data.depositRevenue + data.exchangeRevenue) - data.totalCost,
        netProfit: (data.depositRevenue + data.exchangeRevenue) - data.totalCost
      };
    }).reverse(); // เรียงจากเดือนเก่าไปใหม่
  }

  // 5. การวิเคราะห์ธุรกรรม (ฝาก/โอน)
  async getTransactionAnalysis(filters: AccountFilters): Promise<TransactionAnalysis> {
    const depositData = await prisma.$queryRaw<Array<{
      total_count: number;
      total_rmb: number;
      total_thb: number;
    }>>`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(amountRMB), 0) as total_rmb,
        COALESCE(SUM(amount), 0) as total_thb
      FROM finance_customer_deposit 
      WHERE deletedAt IS NULL
        ${filters.startDate && filters.endDate ? 
          Prisma.sql`AND createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : 
          Prisma.empty}
    `;

    const exchangeData = await prisma.$queryRaw<Array<{
      total_count: number;
      total_rmb: number;
      total_thb: number;
    }>>`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(amountRMB), 0) as total_rmb,
        COALESCE(SUM(amount), 0) as total_thb
      FROM finance_exchange 
      WHERE deletedAt IS NULL
        ${filters.startDate && filters.endDate ? 
          Prisma.sql`AND createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}` : 
          Prisma.empty}
    `;

    const deposit = depositData[0] || { total_count: 0, total_rmb: 0, total_thb: 0 };
    const exchange = exchangeData[0] || { total_count: 0, total_rmb: 0, total_thb: 0 };

    return {
      totalDepositTransactions: Number(deposit.total_count) || 0,
      totalTransferTransactions: Number(exchange.total_count) || 0,
      depositAmountRMB: Number(deposit.total_rmb) || 0,
      transferAmountRMB: Number(exchange.total_rmb) || 0,
      totalTransactionRMB: (Number(deposit.total_rmb) || 0) + (Number(exchange.total_rmb) || 0),
      depositAmountTHB: Number(deposit.total_thb) || 0,
      transferAmountTHB: Number(exchange.total_thb) || 0,
      totalTransactionTHB: (Number(deposit.total_thb) || 0) + (Number(exchange.total_thb) || 0)
    };
  }

  // 6. ลูกค้า Top 5 (ที่จอง book มาเยอะสุด)
  async getTopCustomers(filters: AccountFilters): Promise<CustomerRanking[]> {
    const topCustomers = filters.startDate && filters.endDate ?
      await prisma.$queryRaw<Array<{
        customer_id: string;
        customer_name: string;
        total_transactions: number;
        total_amount_rmb: number;
        total_amount_thb: number;
      }>>`
        SELECT 
          customer_id,
          customer_name,
          SUM(transaction_count) as total_transactions,
          SUM(amount_rmb) as total_amount_rmb,
          SUM(amount_thb) as total_amount_thb
        FROM (
          SELECT 
            fcd.customerId as customer_id,
            COALESCE(c.cus_fullname, fcd.customerId) as customer_name,
            COUNT(fcd.id) as transaction_count,
            SUM(COALESCE(fcd.amountRMB, 0)) as amount_rmb,
            SUM(COALESCE(fcd.amount, 0)) as amount_thb
          FROM finance_customer_deposit fcd
          LEFT JOIN customer c ON fcd.customerId = c.id AND c.deletedAt IS NULL
          WHERE fcd.deletedAt IS NULL 
            AND fcd.customerId IS NOT NULL
            AND fcd.createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}
          GROUP BY fcd.customerId, c.cus_fullname
          
          UNION ALL
          
          SELECT 
            fe.customerId as customer_id,
            COALESCE(c.cus_fullname, fe.customerId) as customer_name,
            COUNT(fe.id) as transaction_count,
            SUM(COALESCE(fe.amountRMB, 0)) as amount_rmb,
            SUM(COALESCE(fe.amount, 0)) as amount_thb
          FROM finance_exchange fe
          LEFT JOIN customer c ON fe.customerId = c.id AND c.deletedAt IS NULL
          WHERE fe.deletedAt IS NULL 
            AND fe.customerId IS NOT NULL
            AND fe.createdAt BETWEEN ${filters.startDate} AND ${filters.endDate}
          GROUP BY fe.customerId, c.cus_fullname
        ) combined
        GROUP BY customer_id, customer_name
        HAVING total_amount_rmb > 0
        ORDER BY total_amount_rmb DESC, total_transactions DESC
        LIMIT 5
      ` : await prisma.$queryRaw<Array<{
        customer_id: string;
        customer_name: string;
        total_transactions: number;
        total_amount_rmb: number;
        total_amount_thb: number;
      }>>`
        SELECT 
          customer_id,
          customer_name,
          SUM(transaction_count) as total_transactions,
          SUM(amount_rmb) as total_amount_rmb,
          SUM(amount_thb) as total_amount_thb
        FROM (
          SELECT 
            fcd.customerId as customer_id,
            COALESCE(c.cus_fullname, fcd.customerId) as customer_name,
            COUNT(fcd.id) as transaction_count,
            SUM(COALESCE(fcd.amountRMB, 0)) as amount_rmb,
            SUM(COALESCE(fcd.amount, 0)) as amount_thb
          FROM finance_customer_deposit fcd
          LEFT JOIN customer c ON fcd.customerId = c.id AND c.deletedAt IS NULL
          WHERE fcd.deletedAt IS NULL 
            AND fcd.customerId IS NOT NULL
          GROUP BY fcd.customerId, c.cus_fullname
          
          UNION ALL
          
          SELECT 
            fe.customerId as customer_id,
            COALESCE(c.cus_fullname, fe.customerId) as customer_name,
            COUNT(fe.id) as transaction_count,
            SUM(COALESCE(fe.amountRMB, 0)) as amount_rmb,
            SUM(COALESCE(fe.amount, 0)) as amount_thb
          FROM finance_exchange fe
          LEFT JOIN customer c ON fe.customerId = c.id AND c.deletedAt IS NULL
          WHERE fe.deletedAt IS NULL 
            AND fe.customerId IS NOT NULL
          GROUP BY fe.customerId, c.cus_fullname
        ) combined
        GROUP BY customer_id, customer_name
        HAVING total_amount_rmb > 0
        ORDER BY total_amount_rmb DESC, total_transactions DESC
        LIMIT 5
      `;

    return topCustomers.map(customer => ({
      customerId: customer.customer_id,
      customerName: customer.customer_name || customer.customer_id,
      totalOrders: Number(customer.total_transactions) || 0,
      totalBillingAmount: Number(customer.total_amount_rmb) || 0,
      totalAmount: Number(customer.total_amount_thb) || 0,
      transactionCount: Number(customer.total_transactions) || 0
    }));
  }

  // 7. Revenue Proportions
  async getRevenueProportions(filters: AccountFilters): Promise<RevenueProportions> {
    const revenueMetrics = await this.getRevenueMetrics(filters);
    
    const depositPercentage = revenueMetrics.totalRevenue > 0 ? 
      (revenueMetrics.totalDepositRevenue / revenueMetrics.totalRevenue) * 100 : 0;
    const exchangePercentage = revenueMetrics.totalRevenue > 0 ? 
      (revenueMetrics.totalExchangeRevenue / revenueMetrics.totalRevenue) * 100 : 0;

    return {
      depositRevenue: revenueMetrics.totalDepositRevenue,
      exchangeRevenue: revenueMetrics.totalExchangeRevenue,
      depositPercentage: Number(depositPercentage.toFixed(2)),
      exchangePercentage: Number(exchangePercentage.toFixed(2))
    };
  }

  // 8. Expense Proportions
  async getExpenseProportions(filters: AccountFilters): Promise<ExpenseProportions[]> {
    const costMetrics = await this.getCostMetrics(filters);
    
    const proportions = [
      {
        category: 'ต้นทุนขาย',
        amount: costMetrics.costOfSales,
        percentage: costMetrics.totalAllExpenses > 0 ? 
          (costMetrics.costOfSales / costMetrics.totalAllExpenses) * 100 : 0
      },
      {
        category: 'ค่าขนส่งไทย',
        amount: costMetrics.totalShippingCost,
        percentage: costMetrics.totalAllExpenses > 0 ? 
          (costMetrics.totalShippingCost / costMetrics.totalAllExpenses) * 100 : 0
      },
      {
        category: 'ค่าใช้จ่ายจีน',
        amount: costMetrics.totalChinaExpenses,
        percentage: costMetrics.totalAllExpenses > 0 ? 
          (costMetrics.totalChinaExpenses / costMetrics.totalAllExpenses) * 100 : 0
      },
      {
        category: 'ค่าพนักงาน',
        amount: costMetrics.expenseBreakdown.employeeCost,
        percentage: costMetrics.totalAllExpenses > 0 ? 
          (costMetrics.expenseBreakdown.employeeCost / costMetrics.totalAllExpenses) * 100 : 0
      },
      {
        category: 'ค่าโกดัง',
        amount: costMetrics.expenseBreakdown.warehouseCost,
        percentage: costMetrics.totalAllExpenses > 0 ? 
          (costMetrics.expenseBreakdown.warehouseCost / costMetrics.totalAllExpenses) * 100 : 0
      },
      {
        category: 'ค่าศุลกากร',
        amount: costMetrics.expenseBreakdown.customsCost,
        percentage: costMetrics.totalAllExpenses > 0 ? 
          (costMetrics.expenseBreakdown.customsCost / costMetrics.totalAllExpenses) * 100 : 0
      },
      {
        category: 'ค่าท่าเรือ',
        amount: costMetrics.expenseBreakdown.portFees,
        percentage: costMetrics.totalAllExpenses > 0 ? 
          (costMetrics.expenseBreakdown.portFees / costMetrics.totalAllExpenses) * 100 : 0
      },
      {
        category: 'ค่าใช้จ่ายอื่นๆ',
        amount: costMetrics.expenseBreakdown.otherExpenses,
        percentage: costMetrics.totalAllExpenses > 0 ? 
          (costMetrics.expenseBreakdown.otherExpenses / costMetrics.totalAllExpenses) * 100 : 0
      }
    ];

    return proportions.map(p => ({
      ...p,
      percentage: Number(p.percentage.toFixed(2))
    })).filter(p => p.amount > 0); // กรองเฉพาะรายการที่มีจำนวนเงิน
  }
}

export default new AccountDashboardRepository();
