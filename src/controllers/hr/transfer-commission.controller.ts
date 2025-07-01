import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

/**
 * Save commission for a transfer
 * @param req Request
 * @param res Response
 * @returns Response
 */
export const saveTransferCommission = async (req: Request, res: Response) => {
  try {
    const { transferId, salespersonId, commission } = req.body;

    // Validate required fields
    if (!transferId || !salespersonId || commission === undefined) {
      return res.status(400).json({
        success: false,
        message: "Transfer ID, salesperson ID, and commission are required",
      });
    }

    // Check if transfer exists
    const transfer = await prisma.finance_transaction.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    // Check if salesperson exists
    const salesperson = await prisma.user.findUnique({
      where: { id: salespersonId },
    });

    if (!salesperson) {
      return res.status(404).json({
        success: false,
        message: "Salesperson not found",
      });
    }

    // Check if commission record already exists
    const existingCommission = await prisma.finance_commission.findFirst({
      where: {
        transfer_id: transferId,
        employee_id: salespersonId,
      },
    });

    let result;

    if (existingCommission) {
      // Update existing commission
      result = await prisma.finance_commission.update({
        where: { id: existingCommission.id },
        data: {
          amount: parseFloat(commission.toString()),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new commission record
      result = await prisma.finance_commission.create({
        data: {
          transfer_id: transferId,
          employee_id: salespersonId,
          amount: parseFloat(commission.toString()),
          status: "PENDING", // Default status
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Commission saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving commission:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get commission for a transfer
 * @param req Request
 * @param res Response
 * @returns Response
 */
export const getTransferCommission = async (req: Request, res: Response) => {
  try {
    const { transferId } = req.params;

    if (!transferId) {
      return res.status(400).json({
        success: false,
        message: "Transfer ID is required",
      });
    }

    const commission = await prisma.finance_commission.findFirst({
      where: {
        transfer_id: transferId,
      },
      include: {
        employee: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: commission,
    });
  } catch (error) {
    console.error("Error getting commission:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update commission status
 * @param req Request
 * @param res Response
 * @returns Response
 */
export const updateCommissionStatus = async (req: Request, res: Response) => {
  try {
    const { commissionId } = req.params;
    const { status } = req.body;

    // Validate required fields
    if (!commissionId || !status) {
      return res.status(400).json({
        success: false,
        message: "Commission ID and status are required",
      });
    }

    // Validate status value
    const validStatuses = ["PENDING", "APPROVED", "PAID"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: PENDING, APPROVED, PAID",
      });
    }

    // Check if commission exists
    const existingCommission = await prisma.finance_commission.findUnique({
      where: { id: commissionId },
    });

    if (!existingCommission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    // Update commission status
    const result = await prisma.finance_commission.update({
      where: { id: commissionId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Commission status updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating commission status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update commission amount
 * @param req Request
 * @param res Response
 * @returns Response
 */
export const updateCommissionAmount = async (req: Request, res: Response) => {
  try {
    const { commissionId } = req.params;
    const { amount } = req.body;

    // Validate required fields
    if (!commissionId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Commission ID and amount are required",
      });
    }

    // Validate amount
    const commissionAmount = parseFloat(amount.toString());
    if (isNaN(commissionAmount) || commissionAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid commission amount. Must be a positive number",
      });
    }

    // Check if commission exists
    const existingCommission = await prisma.finance_commission.findUnique({
      where: { id: commissionId },
    });

    if (!existingCommission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    // Update commission amount
    const result = await prisma.finance_commission.update({
      where: { id: commissionId },
      data: {
        amount: commissionAmount,
        updatedAt: new Date(),
      },
      include: {
        employee: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Commission amount updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating commission amount:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get commission summary data for export
 * @param req Request
 * @param res Response
 * @returns Response
 */
export const getCommissionSummary = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse dates or use defaults (current month)
    let parsedStartDate: Date;
    let parsedEndDate: Date;
    
    if (startDate && typeof startDate === 'string') {
      parsedStartDate = new Date(startDate);
    } else {
      // Default to first day of current month
      const now = new Date();
      parsedStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    if (endDate && typeof endDate === 'string') {
      parsedEndDate = new Date(endDate);
    } else {
      // Default to last day of current month
      const now = new Date();
      parsedEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    // Set time to beginning and end of day
    parsedStartDate.setHours(0, 0, 0, 0);
    parsedEndDate.setHours(23, 59, 59, 999);
    
    // Get all transactions in the date range
    const transactions = await prisma.$queryRaw`
      SELECT 
        ft.id, 
        ft.type, 
        ft.date, 
        ft.documentNumber as document_number, 
        ft.amountRMB as amount_rmb, 
        fcd.amount as amount_thb,
        fcd.exchangeRate as exchange_rate,
        fcd.fee,
        u.id as employee_id,
        u.fullname as employee_name,
        fc.id as commission_id,
        fc.amount as commission_amount,
        fc.status as commission_status
      FROM 
        finance_transaction ft
      LEFT JOIN 
        finance_customer_deposit fcd ON ft.customerDepositId = fcd.id
      LEFT JOIN 
        user u ON ft.salespersonId = u.id
      LEFT JOIN 
        finance_commission fc ON ft.id = fc.transfer_id
      WHERE 
        ft.date BETWEEN ${parsedStartDate} AND ${parsedEndDate}
        AND ft.deletedAt IS NULL
      ORDER BY
        u.fullname, ft.type, ft.date
    `;
    
    // Get all transfer types
    const transferTypes = await prisma.$queryRaw`
      SELECT * FROM finance_transfer_type WHERE deletedAt IS NULL
    `;
    
    // Log the transfer types to debug
    console.log("Available transfer types:", transferTypes);
    
    // Group transactions by employee and then by type
    const summaryByEmployee: Record<string, any> = {};
    
    // Define Thai names for transaction types
    const thaiTypeNames: Record<string, string> = {
      'DEPOSIT': 'ฝากโอน',
      'deposit': 'ฝากโอน',
      'PURCHASE': 'ฝากสั่ง',
      'purchase': 'ฝากสั่ง',
      'TOPUP': 'ฝากเติม',
      'topup': 'ฝากเติม',
      'ORDER': 'ฝากสั่งซื้อ',
      'order': 'ฝากสั่งซื้อ',
      'PAY': 'ฝากชำระ',
      'pay': 'ฝากชำระ'
    };
    
    // Process transactions
    (transactions as any[]).forEach((transaction: any) => {
      // Skip if no employee
      if (!transaction.employee_id || !transaction.employee_name) {
        return;
      }
      
      // Initialize employee data if not exists
      if (!summaryByEmployee[transaction.employee_id]) {
        summaryByEmployee[transaction.employee_id] = {
          id: transaction.employee_id,
          name: transaction.employee_name,
          types: {},
          totalCount: 0,
          totalCommission: 0
        };
      }
      
      // ใช้ค่า type จริงจากตาราง finance_transaction
      const transactionType = transaction.type || "อื่นๆ";
      
      // แปลงรหัสประเภทเป็นภาษาไทย
      const thaiTypeName = thaiTypeNames[transactionType] || transactionType;
      
      // Initialize type data for this employee if not exists
      if (!summaryByEmployee[transaction.employee_id].types[thaiTypeName]) {
        summaryByEmployee[transaction.employee_id].types[thaiTypeName] = {
          count: 0,
          totalCommission: 0,
          transactions: []
        };
      }
      
      // Calculate commission amount - use only actual commission from DB
      const commissionAmount = transaction.commission_amount ? 
        Number(transaction.commission_amount) : 0;
      
      // Update counts and totals
      summaryByEmployee[transaction.employee_id].types[thaiTypeName].count += 1;
      summaryByEmployee[transaction.employee_id].types[thaiTypeName].totalCommission += commissionAmount;
      summaryByEmployee[transaction.employee_id].totalCount += 1;
      summaryByEmployee[transaction.employee_id].totalCommission += commissionAmount;
      
      // Add transaction to list
      summaryByEmployee[transaction.employee_id].types[thaiTypeName].transactions.push({
        id: transaction.id,
        type: thaiTypeName, // ใช้ชื่อประเภทเป็นภาษาไทย
        date: transaction.date,
        documentNumber: transaction.document_number,
        amountRMB: Number(transaction.amount_rmb) || 0,
        amountTHB: Number(transaction.amount_thb) || 0,
        exchangeRate: Number(transaction.exchange_rate) || 0,
        fee: Number(transaction.fee) || 0,
        commission: {
          amount: commissionAmount, // Use actual commission amount
          status: transaction.commission_id ? transaction.commission_status : 'PENDING'
        }
      });
    });
    
    // Convert to array for easier processing
    const employeeSummaries = Object.values(summaryByEmployee);
    
    // Debug log to see what transaction types are found
    console.log("Transaction types found:", employeeSummaries.length > 0 ? Object.keys(employeeSummaries[0].types || {}) : "No employees found");
    console.log("Raw transaction types:", (transactions as any[]).map(t => t.type).filter((v, i, a) => a.indexOf(v) === i));
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Define the transaction types in Thai
    const transactionTypesForSheets = ['ฝากโอน', 'ฝากสั่ง', 'ฝากเติม', 'ฝากสั่งซื้อ', 'ฝากชำระ'];
    
    // Create a summary sheet for each transaction type
    transactionTypesForSheets.forEach(transactionType => {
      // Skip if no transactions of this type
      let hasTransactions = false;
      employeeSummaries.forEach((employee: any) => {
        if (employee.types[transactionType] && employee.types[transactionType].count > 0) {
          hasTransactions = true;
        }
      });
      
      if (!hasTransactions) return;
      
      // Create summary data for this transaction type
      const typeData = [
        [`รายงานสรุปค่าคอมมิชชั่น - ${transactionType}`],
        [`วันที่: ${parsedStartDate.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} ถึง ${parsedEndDate.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`],
        [],
        ['พนักงาน', 'จำนวนรายการ', 'ค่าคอมมิชชั่น (THB)'],
      ];
      
      // Add employee data for this transaction type
      let totalCount = 0;
      let totalCommission = 0;
      
      employeeSummaries.forEach((employee: any) => {
        if (employee.types[transactionType] && employee.types[transactionType].count > 0) {
          typeData.push([
            employee.name,
            employee.types[transactionType].count,
            employee.types[transactionType].totalCommission.toFixed(2),
          ]);
          
          totalCount += employee.types[transactionType].count;
          totalCommission += employee.types[transactionType].totalCommission;
        }
      });
      
      // Add total row
      if (totalCount > 0) {
        typeData.push([
          'รวมทั้งหมด',
          String(totalCount),
          totalCommission.toFixed(2),
        ]);
      }
      
      const typeWorksheet = XLSX.utils.aoa_to_sheet(typeData);
      
      // Set column widths
      const colWidths = [
        { wch: 25 }, // Employee
        { wch: 15 }, // Count
        { wch: 20 }, // Commission
      ];
      typeWorksheet['!cols'] = colWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, typeWorksheet, transactionType);
      
      // Create detail worksheet for this transaction type
      const detailData = [
        [`รายละเอียดค่าคอมมิชชั่น - ${transactionType}`],
        [`วันที่: ${parsedStartDate.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} ถึง ${parsedEndDate.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`],
        [],
        [
          'พนักงาน',
          'วันที่',
          'เลขที่เอกสาร',
          'ประเภทรายการ (Code)',
          'จำนวนเงิน (RMB)',
          'จำนวนเงิน (THB)',
          'อัตราแลกเปลี่ยน',
          'ค่าธรรมเนียม',
          'ค่าคอมมิชชั่น',
          'สถานะ',
        ],
      ];
      
      // Add transaction data for this type
      employeeSummaries.forEach((employee: any) => {
        if (employee.types[transactionType] && employee.types[transactionType].transactions.length > 0) {
          // Add transactions for this employee
          employee.types[transactionType].transactions.forEach((transaction: any) => {
            const date = transaction.date ? new Date(transaction.date).toLocaleDateString('th-TH') : '';
            const status = transaction.commission
              ? transaction.commission.status === 'PENDING'
                ? 'รอดำเนินการ'
                : transaction.commission.status === 'APPROVED'
                ? 'อนุมัติแล้ว'
                : transaction.commission.status === 'PAID'
                ? 'จ่ายแล้ว'
                : transaction.commission.status
              : '-';
            
            detailData.push([
              employee.name,
              date,
              transaction.documentNumber || '',
              transaction.type || '-',
              transaction.amountRMB.toFixed(2),
              transaction.amountTHB.toFixed(2),
              transaction.exchangeRate.toFixed(2),
              transaction.fee.toFixed(2),
              transaction.commission ? transaction.commission.amount.toFixed(2) : '-',
              status,
            ]);
          });
          
          // Add empty row between employees
          detailData.push(['', '', '', '', '', '', '', '', '', '']);
        }
      });
      
      if (detailData.length > 4) { // Only create detail sheet if there are transactions
        const detailWorksheet = XLSX.utils.aoa_to_sheet(detailData);
        
        // Set column widths for detail sheet
        const detailColWidths = [
          { wch: 25 }, // Employee
          { wch: 15 }, // Date
          { wch: 20 }, // Document Number
          { wch: 20 }, // Type Code
          { wch: 15 }, // Amount RMB
          { wch: 15 }, // Amount THB
          { wch: 15 }, // Exchange Rate
          { wch: 15 }, // Fee
          { wch: 15 }, // Commission
          { wch: 15 }, // Status
        ];
        detailWorksheet['!cols'] = detailColWidths;
        
        // Add detail worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, detailWorksheet, `${transactionType} รายละเอียด`);
      }
    });
    
    // Create overall summary worksheet
    const summaryData = [
      ['รายงานสรุปค่าคอมมิชชั่นแยกตามพนักงาน'],
      [`วันที่: ${parsedStartDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })} ถึง ${parsedEndDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`],
      [],
      ['พนักงาน', 'ประเภทรายการ', 'จำนวนรายการ', 'ค่าคอมมิชชั่นรวม (THB)'],
    ];
    
    // Add summary data
    employeeSummaries.forEach((employee: any) => {
      let isFirstTypeForEmployee = true;
      
      // Add data for each transaction type in the defined order
      Object.keys(employee.types).forEach(typeName => {
        if (employee.types[typeName] && employee.types[typeName].count > 0) {
          summaryData.push([
            isFirstTypeForEmployee ? employee.name : '',
            typeName,
            employee.types[typeName].count,
            employee.types[typeName].totalCommission.toFixed(2),
          ]);
          isFirstTypeForEmployee = false;
        }
      });
      
      // Add employee total
      summaryData.push([
        '',
        'รวม',
        employee.totalCount,
        employee.totalCommission.toFixed(2),
      ]);
      
      // Add empty row between employees
      summaryData.push(['', '', '', '']);
    });
    
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths for summary sheet
    const summaryColWidths = [
      { wch: 25 }, // Employee
      { wch: 20 }, // Type
      { wch: 15 }, // Count
      { wch: 20 }, // Total Commission
    ];
    summaryWorksheet['!cols'] = summaryColWidths;
    
    // Add summary worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'สรุปทั้งหมด');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=commission_summary_by_employee_${parsedStartDate.toISOString().split('T')[0]}_to_${parsedEndDate.toISOString().split('T')[0]}.xlsx`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    // Send file
    return res.send(excelBuffer);
  } catch (error) {
    console.error("Error exporting commission summary:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Export commission summary data as Excel
 * @param req Request
 * @param res Response
 * @returns Response
 */
export const exportCommissionSummary = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, month, year } = req.query;
    
    // Make date parameters optional
    let formattedStartDate = '';
    let formattedEndDate = '';
    let dateFilter = '';
    
    if (month && year) {
      // Handle month/year filter
      const monthStr = month.toString().padStart(2, '0');
      const yearStr = year.toString();
      
      // Create first and last day of the month
      const firstDay = `${yearStr}-${monthStr}-01`;
      const lastDay = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
      const lastDayOfMonth = `${yearStr}-${monthStr}-${lastDay.toString().padStart(2, '0')}`;
      
      formattedStartDate = new Date(firstDay).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      formattedEndDate = new Date(lastDayOfMonth).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      dateFilter = `AND ft.date >= '${firstDay}' AND ft.date <= '${lastDayOfMonth}'`;
    } else if (startDate && endDate) {
      // Handle date range filter
      const parsedStartDate = new Date(startDate as string);
      const parsedEndDate = new Date(endDate as string);
      
      formattedStartDate = parsedStartDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      formattedEndDate = parsedEndDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      dateFilter = `AND ft.date >= '${startDate}' AND ft.date <= '${endDate}'`;
    } else {
      formattedStartDate = 'ทั้งหมด';
      formattedEndDate = 'ทั้งหมด';
    }
    
    // Query transactions with commission data (with optional date filter)
    let transactions;
    
    if (dateFilter) {
      // Query with date filter
      transactions = await prisma.$queryRawUnsafe(`
        SELECT 
          ft.id, 
          ft.type, 
          ft.date, 
          ft.documentNumber as document_number, 
          ft.amountRMB as amount_rmb,
          fcd.amountRMB as amount_rmb_deposit,
          fcd.exchangeRate as exchange_rate,
          fcd.fee,
          fcd.amount as amount_thb,
          u.id as employee_id,
          u.fullname as employee_name,
          fc.id as commission_id,
          fc.amount as commission_amount,
          fc.status as commission_status
        FROM finance_transaction ft
        LEFT JOIN finance_customer_deposit fcd ON ft.customerDepositId = fcd.id
        LEFT JOIN user u ON ft.salespersonId = u.id
        LEFT JOIN finance_commission fc ON ft.id = fc.transfer_id
        WHERE ft.deletedAt IS NULL ${dateFilter}
        ORDER BY u.fullname, ft.date
      `);
    } else {
      // Query without date filter (all data)
      transactions = await prisma.$queryRaw`
        SELECT 
          ft.id, 
          ft.type, 
          ft.date, 
          ft.documentNumber as document_number, 
          ft.amountRMB as amount_rmb,
          fcd.amountRMB as amount_rmb_deposit,
          fcd.exchangeRate as exchange_rate,
          fcd.fee,
          fcd.amount as amount_thb,
          u.id as employee_id,
          u.fullname as employee_name,
          fc.id as commission_id,
          fc.amount as commission_amount,
          fc.status as commission_status
        FROM finance_transaction ft
        LEFT JOIN finance_customer_deposit fcd ON ft.customerDepositId = fcd.id
        LEFT JOIN user u ON ft.salespersonId = u.id
        LEFT JOIN finance_commission fc ON ft.id = fc.transfer_id
        WHERE ft.deletedAt IS NULL
        ORDER BY u.fullname, ft.date
      `;
    }
    
    // Define transaction types mapping
    const thaiTypeNames: { [key: string]: string } = {
      'DEPOSIT': 'ฝากโอน',
      'deposit': 'ฝากโอน',
      'PURCHASE': 'ฝากสั่ง',
      'purchase': 'ฝากสั่ง',
      'TOPUP': 'ฝากเติม',
      'topup': 'ฝากเติม',
      'ORDER': 'ฝากสั่งซื้อ',
      'order': 'ฝากสั่งซื้อ',
      'PAYMENT': 'ฝากชำระ',
      'payment': 'ฝากชำระ',
    };
    
    // Define transaction types for sheets
    const transactionTypesForSheets = ['ฝากโอน', 'ฝากสั่ง', 'ฝากเติม', 'ฝากสั่งซื้อ', 'ฝากชำระ'];
    
    // Initialize summary by employee
    const summaryByEmployee: { [key: string]: any } = {};
    
    // Process transactions
    (transactions as any[]).forEach((transaction: any) => {
      // Skip if no employee
      if (!transaction.employee_id || !transaction.employee_name) {
        return;
      }
      
      // Initialize employee data if not exists
      if (!summaryByEmployee[transaction.employee_id]) {
        summaryByEmployee[transaction.employee_id] = {
          id: transaction.employee_id,
          name: transaction.employee_name,
          types: {},
          totalCount: 0,
          totalCommission: 0
        };
      }
      
      // ใช้ค่า type จริงจากตาราง finance_transaction
      const transactionType = transaction.type || "อื่นๆ";
      
      // แปลงรหัสประเภทเป็นภาษาไทย
      const thaiTypeName = thaiTypeNames[transactionType] || transactionType;
      
      // Initialize type data for this employee if not exists
      if (!summaryByEmployee[transaction.employee_id].types[thaiTypeName]) {
        summaryByEmployee[transaction.employee_id].types[thaiTypeName] = {
          count: 0,
          totalCommission: 0,
          transactions: []
        };
      }
      
      // Calculate commission amount - use only actual commission from DB
      const commissionAmount = transaction.commission_amount ? 
        Number(transaction.commission_amount) : 0;
      
      // Update counts and totals
      summaryByEmployee[transaction.employee_id].types[thaiTypeName].count += 1;
      summaryByEmployee[transaction.employee_id].types[thaiTypeName].totalCommission += commissionAmount;
      summaryByEmployee[transaction.employee_id].totalCount += 1;
      summaryByEmployee[transaction.employee_id].totalCommission += commissionAmount;
      
      // Add transaction to list
      summaryByEmployee[transaction.employee_id].types[thaiTypeName].transactions.push({
        id: transaction.id,
        type: thaiTypeName, // ใช้ชื่อประเภทเป็นภาษาไทย
        date: transaction.date,
        documentNumber: transaction.document_number,
        amountRMB: Number(transaction.amount_rmb) || 0,
        amountTHB: Number(transaction.amount_thb) || 0,
        exchangeRate: Number(transaction.exchange_rate) || 0,
        fee: Number(transaction.fee) || 0,
        commission: {
          amount: commissionAmount, // Use actual commission amount
          status: transaction.commission_id ? transaction.commission_status : 'PENDING'
        }
      });
    });
    
    // Convert to array for easier processing
    const employeeSummaries = Object.values(summaryByEmployee);
    
    // Debug log to see what transaction types are found
    console.log("Transaction types found:", employeeSummaries.length > 0 ? Object.keys(employeeSummaries[0].types || {}) : "No employees found");
    console.log("Raw transaction types:", (transactions as any[]).map(t => t.type).filter((v, i, a) => a.indexOf(v) === i));
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Create overall summary worksheet
    const summaryData = [
      ['รายงานสรุปค่าคอมมิชชั่นแยกตามพนักงาน'],
      [`วันที่: ${formattedStartDate} ถึง ${formattedEndDate}`],
      [],
      ['พนักงาน', 'ประเภทรายการ (Type)', 'จำนวนรายการ', 'ค่าคอมมิชชั่นรวม (THB)'],
    ];
    
    // Add summary data
    employeeSummaries.forEach((employee: any) => {
      let isFirstTypeForEmployee = true;
      
      // แสดงทุกประเภทรายการที่พนักงานมี
      Object.keys(employee.types).forEach(typeName => {
        if (employee.types[typeName].count > 0) {
          summaryData.push([
            isFirstTypeForEmployee ? employee.name : '',
            typeName,
            employee.types[typeName].count,
            employee.types[typeName].totalCommission.toFixed(2),
          ]);
          isFirstTypeForEmployee = false;
        }
      });
      
      // Add employee total
      summaryData.push([
        '',
        'รวม',
        employee.totalCount,
        employee.totalCommission.toFixed(2),
      ]);
      
      // Add empty row between employees
      summaryData.push(['', '', '', '']);
    });
    
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths for summary sheet
    const summaryColWidths = [
      { wch: 25 }, // Employee
      { wch: 20 }, // Type
      { wch: 15 }, // Count
      { wch: 20 }, // Total Commission
    ];
    summaryWorksheet['!cols'] = summaryColWidths;
    
    // Add summary worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'สรุปรวม');
    
    // Create detail worksheets for each transaction type
    Object.keys(thaiTypeNames).forEach(typeCode => {
      // Find all transactions of this type across all employees
      const typeTransactions: any[] = [];
      employeeSummaries.forEach((employee: any) => {
        if (employee.types[typeCode] && employee.types[typeCode].transactions.length > 0) {
          typeTransactions.push(...employee.types[typeCode].transactions.map((t: any) => ({
            ...t,
            employeeName: employee.name
          })));
        }
      });
      
      if (typeTransactions.length > 0) {
        // Create detail worksheet for this type
        const detailData = [
          [`รายละเอียดค่าคอมมิชชั่น - ${typeCode}`],
          [`วันที่: ${formattedStartDate} ถึง ${formattedEndDate}`],
          [],
          [
            'พนักงาน',
            'วันที่',
            'เลขที่เอกสาร',
            'ประเภทรายการ (Code)',
            'จำนวนเงิน (RMB)',
            'จำนวนเงิน (THB)',
            'อัตราแลกเปลี่ยน',
            'ค่าธรรมเนียม',
            'ค่าคอมมิชชั่น',
            'สถานะ',
          ],
        ];
        
        // Add transaction data
        let currentEmployee = '';
        typeTransactions.forEach((transaction: any) => {
          const date = transaction.date ? new Date(transaction.date).toLocaleDateString('th-TH') : '';
          const status = transaction.commission
            ? transaction.commission.status === 'PENDING'
              ? 'รอดำเนินการ'
              : transaction.commission.status === 'APPROVED'
              ? 'อนุมัติแล้ว'
              : transaction.commission.status === 'PAID'
              ? 'จ่ายแล้ว'
              : transaction.commission.status
            : '-';
          
          detailData.push([
            transaction.employeeName !== currentEmployee ? transaction.employeeName : '',
            date,
            transaction.documentNumber || '',
            transaction.type,
            transaction.amountRMB.toFixed(2),
            transaction.amountTHB.toFixed(2),
            transaction.exchangeRate.toFixed(4),
            transaction.fee.toFixed(2),
            transaction.commission ? transaction.commission.amount.toFixed(2) : '0.00', // Show actual commission
            status,
          ]);
          
          if (transaction.employeeName !== currentEmployee) {
            currentEmployee = transaction.employeeName;
          }
        });
        
        const detailWorksheet = XLSX.utils.aoa_to_sheet(detailData);
        
        // Set column widths for detail sheet
        const detailColWidths = [
          { wch: 25 }, // Employee
          { wch: 15 }, // Date
          { wch: 20 }, // Document Number
          { wch: 20 }, // Type Code
          { wch: 15 }, // Amount RMB
          { wch: 15 }, // Amount THB
          { wch: 15 }, // Exchange Rate
          { wch: 15 }, // Fee
          { wch: 15 }, // Commission
          { wch: 15 }, // Status
        ];
        detailWorksheet['!cols'] = detailColWidths;
        
        // Add detail worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, detailWorksheet, `รายละเอียด-${typeCode}`);
      }
    });
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=commission-summary-${startDate}-to-${endDate}.xlsx`);
    
    // Send file
    return res.send(Buffer.from(excelBuffer));
    
  } catch (error) {
    console.error("Error exporting commission summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export commission summary",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Get commission by commission ID
 * @param req Request
 * @param res Response
 * @returns Response
 */
export const getCommissionById = async (req: Request, res: Response) => {
  try {
    const { commissionId } = req.params;

    if (!commissionId) {
      return res.status(400).json({
        success: false,
        message: "Commission ID is required",
      });
    }

    const commission = await prisma.finance_commission.findUnique({
      where: { id: commissionId },
      include: {
        employee: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
      },
    });

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: commission,
    });
  } catch (error) {
    console.error("Error getting commission by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTransferTypes = async (req: Request, res: Response) => {
  try {
    const transferTypes = await prisma.finance_transfer_type.findMany({
      where: {
        deletedAt: null
      }
    });
    
    return res.status(200).json({
      success: true,
      data: transferTypes
    });
  } catch (error) {
    console.error("Error getting transfer types:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const bulkCalculateTransferCommission = async (req: Request, res: Response) => {
  try {
    const { transfer_ids } = req.body;

    if (!Array.isArray(transfer_ids) || transfer_ids.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "กรุณาระบุรายการที่ต้องการคำนวณค่าคอมมิชชั่น" 
      });
    }

    const results = [];
    const errors = [];

    // Process each transfer
    for (const transferId of transfer_ids) {
      try {
        // Get transfer data
        const transfer = await prisma.finance_transaction.findUnique({
          where: { id: transferId },
          include: {
            user: true,
            customerDeposit: true,
            exchange: true
          }
        });

        if (!transfer) {
          errors.push({ transferId, error: "ไม่พบข้อมูลการโอน" });
          continue;
        }

        // Check if salesperson exists
        if (!transfer.salespersonId) {
          errors.push({ transferId, error: "ไม่พบข้อมูลพนักงานขาย" });
          continue;
        }

        // Check if commission already exists
        const existingCommission = await prisma.finance_commission.findFirst({
          where: { 
            transfer_id: transferId,
            deletedAt: null
          }
        });

        if (existingCommission) {
          errors.push({ transferId, error: "มีการคำนวณค่าคอมมิชชั่นแล้ว" });
          continue;
        }

        // Get transfer type name - ใช้ logic เดียวกับ frontend
        let transferTypeName = '';
        
        // ตรวจสอบว่า type เป็นภาษาไทยอยู่แล้วหรือไม่
        const thaiTypes = ["ฝากโอน", "ฝากสั่ง", "ฝากเติม", "ฝากสั่งซื้อ", "ฝากชำระ"];
        if (transfer.type && thaiTypes.includes(transfer.type)) {
          transferTypeName = transfer.type;
        } 
        // แปลงประเภทรายการเป็นภาษาไทย
        else if (transfer.type) {
          const typeMapping: Record<string, string> = {
            'DEPOSIT': 'ฝากโอน',
            'deposit': 'ฝากโอน',
            'PURCHASE': 'ฝากสั่ง',
            'purchase': 'ฝากสั่ง',
            'TOPUP': 'ฝากเติม',
            'topup': 'ฝากเติม',
            'ORDER': 'ฝากสั่ง',
            'order': 'ฝากสั่ง',
            'PAYMENT': 'ฝากชำระ',
            'payment': 'ฝากชำระ',
            'PAY': 'ฝากชำระ',
            'pay': 'ฝากชำระ'
          };
          transferTypeName = typeMapping[transfer.type] || '';
        }
        
        // ตรวจสอบประเภทรายการจากข้อมูลที่มี (ตาม logic frontend)
        if (!transferTypeName) {
          if (transfer.customerDeposit) {
            transferTypeName = "ฝากโอน";
          } else if (transfer.exchange) {
            const exchangeType = transfer.exchange.type?.toLowerCase() || "";
            
            if (exchangeType === "purchase") {
              transferTypeName = "ฝากสั่ง";
            } else if (exchangeType === "topup") {
              transferTypeName = "ฝากเติม";
            } else if (exchangeType === "order") {
              transferTypeName = "ฝากสั่ง";
            } else if (exchangeType === "payment" || exchangeType === "pay") {
              transferTypeName = "ฝากชำระ";
            } else {
              // แสดงค่า type จาก exchange ถ้ามี
              transferTypeName = transfer.exchange.type || "ฝากโอน";
            }
          } else {
            transferTypeName = "ฝากโอน"; // default
          }
        }

        // Debug log
        console.log(`Transfer ${transferId}: type_name = "${transferTypeName}"`);

        // Get commission rate from transfer type settings
        const transferTypeConfig = await prisma.finance_transfer_type.findFirst({
          where: {
            type_name: transferTypeName,
            is_active: true,
            deletedAt: null
          }
        });

        // Debug log
        console.log(`Transfer type config found:`, transferTypeConfig);

        if (!transferTypeConfig || !transferTypeConfig.commission_rate) {
          errors.push({ transferId, error: `ไม่พบการตั้งค่าอัตราค่าคอมสำหรับประเภท ${transferTypeName}` });
          continue;
        }

        // Use fixed commission amount per transaction (not percentage)
        // commission_rate field contains the fixed amount per transaction
        const commissionAmount = transferTypeConfig.commission_rate;

        // Create commission record
        const commission = await prisma.finance_commission.create({
          data: {
            transfer_id: transferId,
            employee_id: transfer.salespersonId,
            amount: commissionAmount,
            status: "PENDING",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        results.push({
          transferId,
          commissionId: commission.id,
          amount: commissionAmount,
          status: "created"
        });

      } catch (error) {
        console.error(`Error processing transfer ${transferId}:`, error);
        errors.push({ 
          transferId, 
          error: "เกิดข้อผิดพลาดในการคำนวณค่าคอมมิชชั่น" 
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `คำนวณค่าคอมมิชชั่นสำเร็จ ${results.length} รายการ`,
      results,
      errors,
      total: transfer_ids.length,
      successful: results.length,
      failed: errors.length
    });

  } catch (error) {
    console.error("Error in bulk transfer commission calculation:", error);
    return res.status(500).json({ 
      success: false,
      message: "เกิดข้อผิดพลาดในการคำนวณค่าคอมมิชชั่น" 
    });
  }
};
