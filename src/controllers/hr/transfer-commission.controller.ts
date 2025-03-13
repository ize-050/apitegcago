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
        CASE
          WHEN fcd.amount IS NOT NULL THEN fcd.amount
          WHEN fe.amount IS NOT NULL THEN fe.amount
          ELSE 0
        END as amount_thb,
        CASE
          WHEN fcd.exchangeRate IS NOT NULL THEN fcd.exchangeRate
          WHEN fe.exchangeRate IS NOT NULL THEN fe.exchangeRate
          ELSE 0
        END as exchange_rate,
        CASE
          WHEN fcd.fee IS NOT NULL THEN fcd.fee
          WHEN fe.fee IS NOT NULL THEN fe.fee
          ELSE 0
        END as fee,
        u.id as employee_id,
        u.fullname as employee_name,
        fc.id as commission_id,
        fc.amount as commission_amount,
        fc.status as commission_status
      FROM 
        finance_transaction ft
      LEFT JOIN 
        user u ON ft.salespersonId = u.id
      LEFT JOIN 
        finance_commission fc ON ft.id = fc.transfer_id
      LEFT JOIN
        finance_customer_deposit fcd ON ft.customerDepositId = fcd.id
      LEFT JOIN
        finance_exchange fe ON ft.exchangeId = fe.id
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
      
      // Calculate commission amount (15 บาทต่อรายการ)
      const commissionAmount = 15;
      
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
          amount: commissionAmount,
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
      ['พนักงาน', 'ประเภทรายการ', 'จำนวนรายการ', 'ค่าคอมมิชชั่นต่อรายการ (THB)', 'ค่าคอมมิชชั่นรวม (THB)'],
    ];
    
    // Add summary data
    employeeSummaries.forEach((employee: any) => {
      let isFirstTypeForEmployee = true;
      
      // Add data for each transaction type in the defined order
      Object.keys(employee.types).forEach(typeName => {
        if (employee.types[typeName] && employee.types[typeName].count > 0) {
          // ค่าคอมมิชชั่นต่อรายการคงที่ 15 บาท
          const commissionPerTransaction = 15.00;
            
          summaryData.push([
            isFirstTypeForEmployee ? employee.name : '',
            typeName,
            employee.types[typeName].count,
            commissionPerTransaction.toFixed(2),
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
        '15.00',
        employee.totalCommission.toFixed(2),
      ]);
      
      // Add empty row between employees
      summaryData.push(['', '', '', '', '']);
    });
    
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths for summary sheet
    const summaryColWidths = [
      { wch: 25 }, // Employee
      { wch: 20 }, // Type
      { wch: 15 }, // Count
      { wch: 30 }, // Avg Commission
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
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }
    
    // Parse dates
    const parsedStartDate = new Date(startDate as string);
    const parsedEndDate = new Date(endDate as string);
    
    // Format dates for display
    const formattedStartDate = parsedStartDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const formattedEndDate = parsedEndDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // Query transactions with commission data
    const transactions = await prisma.$queryRaw`
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
      WHERE ft.date BETWEEN ${parsedStartDate} AND ${parsedEndDate}
      AND ft.deletedAt IS NULL
      ORDER BY u.fullname, ft.date
    `;
    
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
      
      // Calculate commission amount (15 บาทต่อรายการ)
      const commissionAmount = 15;
      
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
          amount: commissionAmount,
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
      ['พนักงาน', 'ประเภทรายการ (Type)', 'จำนวนรายการ', 'ค่าคอมมิชชั่นต่อรายการ (THB)', 'ค่าคอมมิชชั่นรวม (THB)'],
    ];
    
    // Add summary data
    employeeSummaries.forEach((employee: any) => {
      let isFirstTypeForEmployee = true;
      
      // แสดงทุกประเภทรายการที่พนักงานมี
      Object.keys(employee.types).forEach(typeName => {
        if (employee.types[typeName].count > 0) {
          // ค่าคอมมิชชั่นต่อรายการคงที่ 15 บาท
          const commissionPerTransaction = 15.00;
            
          summaryData.push([
            isFirstTypeForEmployee ? employee.name : '',
            typeName,
            employee.types[typeName].count,
            commissionPerTransaction.toFixed(2),
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
        '15.00',
        employee.totalCommission.toFixed(2),
      ]);
      
      // Add empty row between employees
      summaryData.push(['', '', '', '', '']);
    });
    
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths for summary sheet
    const summaryColWidths = [
      { wch: 25 }, // Employee
      { wch: 20 }, // Type
      { wch: 15 }, // Count
      { wch: 30 }, // Commission Per Transaction
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
        
        // Sort transactions by employee and date
        typeTransactions.sort((a, b) => {
          if (a.employeeName !== b.employeeName) {
            return a.employeeName.localeCompare(b.employeeName);
          }
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
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
          
          // Add empty row between employees
          if (currentEmployee && currentEmployee !== transaction.employeeName) {
            detailData.push(['', '', '', '', '', '', '', '', '', '']);
          }
          currentEmployee = transaction.employeeName;
          
          detailData.push([
            transaction.employeeName,
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
