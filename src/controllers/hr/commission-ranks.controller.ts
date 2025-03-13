import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from 'crypto';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';

const prisma = new PrismaClient();

// Get all commission ranks
export const getCommissionRanks = async (req: Request, res: Response) => {
  try {
    const commissionRanks = await prisma.commission_rank.findMany({
      orderBy: {
        min_amount: "asc",
      },
    });
    
    return res.status(200).json(commissionRanks);
  } catch (error) {
    console.error("Error fetching commission ranks:", error);
    return res.status(500).json({ message: "Failed to fetch commission ranks" });
  }
};

// Create or update commission ranks
export const saveCommissionRanks = async (req: Request, res: Response) => {
  try {
    const { ranks } = req.body;
    
    if (!Array.isArray(ranks)) {
      return res.status(400).json({ message: "Invalid data format" });
    }
    
    // Validate ranks
    for (let i = 0; i < ranks.length; i++) {
      const rank = ranks[i];
      if (rank.min_amount >= rank.max_amount) {
        return res.status(400).json({ 
          message: `Rank ${i + 1} has invalid range (min must be less than max)` 
        });
      }
      
      if (i > 0 && rank.min_amount <= ranks[i - 1].max_amount) {
        return res.status(400).json({ 
          message: `Rank ${i + 1} overlaps with previous rank` 
        });
      }
    }
    
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete all existing ranks
      await tx.commission_rank.deleteMany({});
      
      // Create new ranks
      const createdRanks = await Promise.all(
        ranks.map(rank => 
          tx.commission_rank.create({
            data: {
              min_amount: rank.min_amount,
              max_amount: rank.max_amount,
              percentage: rank.percentage,
            }
          })
        )
      );
      
      return createdRanks;
    });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error saving commission ranks:", error);
    return res.status(500).json({ message: "Failed to save commission ranks" });
  }
};

// Calculate commission based on profit amount
export const calculateCommission = async (req: Request, res: Response) => {
  try {
    const { profit_amount } = req.body;
    
    if (typeof profit_amount !== 'number' || isNaN(profit_amount)) {
      return res.status(400).json({ message: "Invalid profit amount" });
    }
    
    // Find the appropriate rank for the profit amount
    const rank = await prisma.commission_rank.findFirst({
      where: {
        min_amount: { lte: profit_amount },
        max_amount: { gte: profit_amount },
      },
    });
    
    if (!rank) {
      return res.status(404).json({ 
        message: "No commission rank found for the given profit amount",
        commission: 0
      });
    }
    
    // Calculate commission
    const commission = (profit_amount * rank.percentage) / 100;
    
    return res.status(200).json({
      rank,
      profit_amount,
      commission,
    });
  } catch (error) {
    console.error("Error calculating commission:", error);
    return res.status(500).json({ message: "Failed to calculate commission" });
  }
};

// Submit employee commission data
export const submitCommission = async (req: Request, res: Response) => {
  try {
    const { d_purchase_id, commissions, total_commission } = req.body;
    
    if (!d_purchase_id || !commissions || !Array.isArray(commissions) || commissions.length === 0) {
      return res.status(400).json({ message: "Invalid data format" });
    }
    
    // Validate each commission entry
    for (const comm of commissions) {
      if (!comm.employee_id || !comm.commission_type || isNaN(comm.commission_value) || isNaN(comm.commission_amount)) {
        return res.status(400).json({ message: "Invalid commission data format" });
      }
    }
    
    // Verify that all employee IDs exist in the user table
    const employeeIds = commissions.map(comm => comm.employee_id);
    const existingEmployees = await prisma.user.findMany({
      where: {
        id: { in: employeeIds },
        deletedAt: null
      },
      select: { id: true }
    });
    
    const existingEmployeeIds = existingEmployees.map(emp => emp.id);
    const invalidEmployeeIds = employeeIds.filter(id => !existingEmployeeIds.includes(id));
    
    if (invalidEmployeeIds.length > 0) {
      return res.status(400).json({ 
        message: "Some employee IDs do not exist", 
        invalidEmployeeIds 
      });
    }
    
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete any existing commissions for this purchase
      await tx.employee_commission.deleteMany({
        where: { d_purchase_id }
      });
      
      // Create new commission records
      const savedCommissions = await Promise.all(
        commissions.map(async (comm) => {
          return await tx.employee_commission.create({
            data: {
              d_purchase_id,
              employee_id: comm.employee_id,
              commission_type: comm.commission_type,
              commission_value: comm.commission_value,
              commission_amount: comm.commission_amount,
              status: comm.status || "saved"
            }
          });
        })
      );
      
      // Create or update CS department commission (fixed 300 baht)
      try {
        // Check if CS commission already exists for this purchase
        const existingCsCommission = await tx.cs_department_commission.findUnique({
          where: { d_purchase_id }
        });
        
        if (!existingCsCommission) {
          // Create new CS commission record
          await tx.cs_department_commission.create({
            data: {
              d_purchase_id,
              commission_amount: 300, // Fixed 300 baht per purchase
              is_paid: false,
              status: "saved"
            }
          });
        }
      } catch (error) {
        console.error("Error handling CS department commission:", error);
        // Continue with the transaction even if this part fails
      }
      
      return savedCommissions;
    });
    
    return res.status(200).json({
      message: "Commission data saved successfully",
      data: result
    });
  } catch (error) {
    console.error("Error submitting commission data:", error);
    return res.status(500).json({ message: "Failed to save commission data" });
  }
};

// Get CS department commissions
export const getCsDepartmentCommissions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, paid, status } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Build filter conditions
    const where: any = {};
    
    if (paid !== undefined) {
      where.is_paid = paid === 'true';
    }
    
    if (status) {
      where.status = status as string;
    }
    
    // Get total count for pagination
    const totalCount = await prisma.cs_department_commission.count({ where });
    
    // Get commissions with purchase details
    const commissions = await prisma.cs_department_commission.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.status(200).json({
      data: commissions,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error("Error fetching CS department commissions:", error);
    return res.status(500).json({ message: "Failed to fetch CS department commissions" });
  }
};

// Update CS department commission payment status
export const updateCsCommissionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_paid } = req.body;
    
    if (typeof is_paid !== 'boolean') {
      return res.status(400).json({ message: "Invalid data format" });
    }
    
    // Update the commission status using Prisma client
    const updatedCommission = await prisma.cs_department_commission.update({
      where: { id },
      data: {
        is_paid,
        paid_date: is_paid ? new Date() : null
      }
    });
    
    return res.status(200).json({
      message: "Commission status updated successfully",
      data: updatedCommission
    });
  } catch (error) {
    console.error("Error updating CS commission status:", error);
    return res.status(500).json({ message: "Failed to update commission status" });
  }
};

// Check if commission exists for a purchase
export const checkCommissionStatus = async (req: Request, res: Response) => {
  try {
    const { purchaseId } = req.params;
    
    if (!purchaseId) {
      return res.status(400).json({ message: "Purchase ID is required" });
    }
    
    // Check if employee commission exists
    const employeeCommission = await prisma.employee_commission.findFirst({
      where: { d_purchase_id: purchaseId }
    });
    
    // Check if CS department commission exists
    const csCommission = await prisma.cs_department_commission.findUnique({
      where: { d_purchase_id: purchaseId }
    });
    
    return res.status(200).json({
      hasEmployeeCommission: !!employeeCommission,
      hasCsCommission: !!csCommission,
      employeeCommissionStatus: employeeCommission?.status || null,
      csCommissionStatus: csCommission?.status || null
    });
  } catch (error) {
    console.error("Error checking commission status:", error);
    return res.status(500).json({ message: "Failed to check commission status" });
  }
};

// Get employee commissions for a specific purchase
export const getEmployeeCommissions = async (req: Request, res: Response) => {
  try {
    const { purchaseId } = req.params;
    
    if (!purchaseId) {
      return res.status(400).json({ message: "Purchase ID is required" });
    }
    
    // Get the commissions
    const employeeCommissions = await prisma.employee_commission.findMany({
      where: { d_purchase_id: purchaseId },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get all employee IDs from the commissions
    const employeeIds = employeeCommissions.map(comm => comm.employee_id);
    
    // Get the user data for these employees
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: employeeIds
        }
      },
      select: {
        id: true,
        fullname: true
      }
    });
    
    // Map the user data to the commissions
    const commissionsWithEmployeeDetails = employeeCommissions.map(commission => {
      const employee = users.find(user => user.id === commission.employee_id);
      return {
        ...commission,
        employee: employee ? {
          fullname: employee.fullname
        } : null
      };
    });
    
    return res.status(200).json(commissionsWithEmployeeDetails);
  } catch (error) {
    console.error("Error fetching employee commissions:", error);
    return res.status(500).json({ message: "Failed to fetch employee commissions" });
  }
};

// Get CS department commission for a specific purchase
export const getCsCommission = async (req: Request, res: Response) => {
  try {
    const { purchaseId } = req.params;
    
    if (!purchaseId) {
      return res.status(400).json({ message: "Purchase ID is required" });
    }
    
    const csCommission = await prisma.cs_department_commission.findUnique({
      where: { d_purchase_id: purchaseId }
    });
    
    if (!csCommission) {
      return res.status(404).json({ message: "CS department commission not found" });
    }
    
    return res.status(200).json(csCommission);
  } catch (error) {
    console.error("Error fetching CS department commission:", error);
    return res.status(500).json({ message: "Failed to fetch CS department commission" });
  }
};

// Define interfaces for commission data
interface EmployeeCommission {
  id: string;
  d_purchase_id: string;
  employee_id: string;
  commission_type: string;
  commission_value: number;
  commission_amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  employee?: {
    id: string;
    fullname: string;
    [key: string]: any;
  };
  d_purchase?: {
    id: string;
    book_number: string;
    createdAt: Date;
    purchase_finance: Array<{
      billing_amount: number;
      total_profit_loss: number;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
}

interface CsCommission {
  id: string;
  d_purchase_id: string;
  commission_amount: number;
  is_paid: boolean;
  status: string;
  paid_date: Date | null;
  createdAt: Date;
  updatedAt: Date;
  d_purchase?: {
    id: string;
    book_number: string;
    createdAt: Date;
    [key: string]: any;
  };
}

/**
 * Get commission summary data for export as Excel file
 * @param req Request
 * @param res Response
 * @returns Promise<Response>
 */
export const getCommissionSummaryForExport = async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    
    // Get employee commissions with appropriate filters
    let employeeCommissionsQuery: any = {
      where: {

        status: "saved",
      },
      include: {
        employee: true,
        d_purchase: {
          include: {
            purchase_finance: {
              where: {
                deletedAt: null,
                finance_status: "ชำระครบแล้ว",
              },
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    };
    
    // Filter by employee if provided
    if (employeeId) {
      employeeCommissionsQuery.where.employee_id = employeeId as string;
    }
    
    // Add date range filter if provided
    if (startDate || endDate) {
      employeeCommissionsQuery.where.createdAt = {};
      
      if (startDate) {
        employeeCommissionsQuery.where.createdAt.gte = new Date(startDate as string);
      }
      
      if (endDate) {
        // Set time to end of day for endDate
        const endDateTime = new Date(endDate as string);
        endDateTime.setHours(23, 59, 59, 999);
        employeeCommissionsQuery.where.createdAt.lte = endDateTime;
      }
    }
    
    const employeeCommissions = await prisma.employee_commission.findMany(employeeCommissionsQuery) as EmployeeCommission[];
    
    // Get CS department commissions with the same filters
    let csCommissionsQuery: any = {
      where: {
        status: "saved",
      },
      include: {
        d_purchase: true
      },
      orderBy: {
        createdAt: "desc"
      }
    };
    
    // Apply the same date filters to CS commissions
    if (startDate || endDate) {
      csCommissionsQuery.where.createdAt = {};
      
      if (startDate) {
        csCommissionsQuery.where.createdAt.gte = new Date(startDate as string);
      }
      
      if (endDate) {
        const endDateTime = new Date(endDate as string);
        endDateTime.setHours(23, 59, 59, 999);
        csCommissionsQuery.where.createdAt.lte = endDateTime;
      }
    }
    
    const csCommissions = await prisma.cs_department_commission.findMany(csCommissionsQuery) as CsCommission[];
    
    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Tegcago HR System';
    workbook.created = new Date();
    
    // Create a worksheet for employee commissions
    const employeeSheet = workbook.addWorksheet('พนักงานขาย');
    
    // Add headers for employee sheet
    employeeSheet.columns = [
      { header: 'ชื่อพนักงาน', key: 'employeeName', width: 20 },
      { header: 'เลขที่บุ๊คกิ้ง', key: 'bookNumber', width: 15 },
      { header: 'วันที่', key: 'date', width: 15 },
      { header: 'ยอดขาย', key: 'billingAmount', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'กำไร', key: 'profit', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'ประเภทคอมมิชชั่น', key: 'commissionType', width: 20 },
      { header: 'อัตราคอมมิชชั่น', key: 'commissionValue', width: 15 },
      { header: 'จำนวนคอมมิชชั่น', key: 'commissionAmount', width: 15, style: { numFmt: '#,##0.00' } }
    ];
    
    // Group employee commissions by employee
    const employeeMap = new Map<string, {
      id: string;
      name: string;
      commissions: Array<any>;
      totalCommission: number;
    }>();
    
    employeeCommissions.forEach((commission: EmployeeCommission) => {
      const employeeId = commission.employee_id;
      const employeeName = commission.employee?.fullname || 'ไม่ระบุชื่อ';
      
      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          id: employeeId,
          name: employeeName,
          commissions: [],
          totalCommission: 0
        });
      }
      
      const employee = employeeMap.get(employeeId)!;
      const commissionAmount = parseFloat(commission.commission_amount.toString());
      
      employee.totalCommission += commissionAmount;
      
      // Get finance data
      const financeData = commission.d_purchase?.purchase_finance[0];
      const billingAmount = financeData ? parseFloat(financeData.billing_amount.toString()) : 0;
      const profit = financeData ? parseFloat(financeData.total_profit_loss.toString()) : 0;
      
      employee.commissions.push({
        employeeName: employeeName,
        bookNumber: commission.d_purchase?.book_number || '',
        date: commission.d_purchase?.createdAt ? format(new Date(commission.d_purchase.createdAt), 'dd/MM/yyyy') : '',
        billingAmount: billingAmount,
        profit: profit,
        commissionType: commission.commission_type,
        commissionValue: commission.commission_value + '%',
        commissionAmount: commissionAmount
      });
    });
    
    // Add employee commission data to the sheet
    let totalEmployeeCommission = 0;
    
    for (const employee of employeeMap.values()) {
      // Add employee commissions
      employee.commissions.forEach(commission => {
        employeeSheet.addRow(commission);
      });
      
      // Add a summary row for this employee
      employeeSheet.addRow({
        employeeName: `รวม ${employee.name}`,
        commissionAmount: employee.totalCommission
      }).font = { bold: true };
      
      // Add an empty row for separation
      employeeSheet.addRow({});
      
      totalEmployeeCommission += employee.totalCommission;
    }
    
    // Add total row at the bottom
    employeeSheet.addRow({
      employeeName: 'รวมค่าคอมมิชชั่นพนักงานขายทั้งหมด',
      commissionAmount: totalEmployeeCommission
    }).font = { bold: true };
    
    // Style the header row
    employeeSheet.getRow(1).font = { bold: true };
    employeeSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Create a worksheet for CS commissions
    const csSheet = workbook.addWorksheet('CS');
    
    // Add headers for CS sheet
    csSheet.columns = [
      { header: 'เลขที่บุ๊คกิ้ง', key: 'bookNumber', width: 15 },
      { header: 'วันที่', key: 'date', width: 15 },
      { header: 'จำนวนคอมมิชชั่น', key: 'commissionAmount', width: 15, style: { numFmt: '#,##0.00' } }
    ];
    
    // Add CS commission data
    let totalCsCommission = 0;
    
    csCommissions.forEach((commission: CsCommission) => {
      const commissionAmount = parseFloat(commission.commission_amount.toString());
      totalCsCommission += commissionAmount;
      
      csSheet.addRow({
        bookNumber: commission.d_purchase?.book_number || '',
        date: commission.d_purchase?.createdAt ? format(new Date(commission.d_purchase.createdAt), 'dd/MM/yyyy') : '',
        commissionAmount: commissionAmount
      });
    });
    
    // Add total row for CS
    csSheet.addRow({
      bookNumber: 'จำนวนใบงานทั้งหมด',
      date: csCommissions.length.toString()
    }).font = { bold: true };
    
    csSheet.addRow({
      bookNumber: 'รวมค่าคอมมิชชั่น CS ทั้งหมด',
      commissionAmount: totalCsCommission
    }).font = { bold: true };
    
    // Style the header row
    csSheet.getRow(1).font = { bold: true };
    csSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Create a summary worksheet
    const summarySheet = workbook.addWorksheet('สรุป');
    
    // Add summary data
    summarySheet.columns = [
      { header: 'รายการ', key: 'item', width: 30 },
      { header: 'จำนวนเงิน', key: 'amount', width: 15, style: { numFmt: '#,##0.00' } }
    ];
    
    summarySheet.addRow({
      item: 'รวมค่าคอมมิชชั่นพนักงานขายทั้งหมด',
      amount: totalEmployeeCommission
    });
    
    summarySheet.addRow({
      item: 'รวมค่าคอมมิชชั่น CS ทั้งหมด',
      amount: totalCsCommission
    });
    
    summarySheet.addRow({
      item: 'รวมค่าคอมมิชชั่นทั้งหมด',
      amount: totalEmployeeCommission + totalCsCommission
    }).font = { bold: true };
    
    // Style the header row
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Generate filename with date
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `commission_summary_${dateStr}.xlsx`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    // Write to response
    await workbook.xlsx.write(res);
    
    return res.end();
  } catch (error: unknown) {
    console.error("Error in getCommissionSummaryForExport:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: errorMessage
    });
  }
};
