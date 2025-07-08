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

// Delete a single commission rank
export const deleteCommissionRank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Commission rank ID is required" });
    }

    // Check if the commission rank exists
    const existingRank = await prisma.commission_rank.findUnique({
      where: { id },
    });

    if (!existingRank) {
      return res.status(404).json({ message: "Commission rank not found" });
    }

    // Delete the commission rank
    await prisma.commission_rank.delete({
      where: { id },
    });

    return res.status(200).json({ 
      success: true,
      message: "Commission rank deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting commission rank:", error);
    return res.status(500).json({ message: "Failed to delete commission rank" });
  }
};

// Create or update commission ranks
export const saveCommissionRanks = async (req: Request, res: Response) => {
  try {
    const { ranks } = req.body;

    if (!Array.isArray(ranks)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    // Group ranks by work_type for validation
    const ranksByWorkType = ranks.reduce((groups: Record<string, any[]>, rank: any) => {
      if (!groups[rank.work_type]) {
        groups[rank.work_type] = [];
      }
      groups[rank.work_type].push(rank);
      return groups;
    }, {});

    // Validate ranks by work_type
    for (const workType in ranksByWorkType) {
      const workTypeRanks = ranksByWorkType[workType];
      
      // Sort by min_amount for proper validation
      workTypeRanks.sort((a, b) => a.min_amount - b.min_amount);
      
      for (let i = 0; i < workTypeRanks.length; i++) {
        const rank = workTypeRanks[i];
        
        // Check if min_amount < max_amount
        if (rank.min_amount >= rank.max_amount) {
          return res.status(400).json({
            message: `Work type "${workType}" rank ${i + 1} has invalid range (min must be less than max)`
          });
        }
        
        // Check overlap with previous rank in the same work_type
        if (i > 0 && rank.min_amount <= workTypeRanks[i - 1].max_amount) {
          return res.status(400).json({
            message: `Work type "${workType}" rank ${i + 1} overlaps with previous rank`
          });
        }
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
              work_type: rank.work_type || "ALL IN",
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

// Calculate commission based on profit amount and work type
export const calculateCommission = async (req: Request, res: Response) => {
  try {
    const { profit_amount, work_type } = req.body;

    if (typeof profit_amount !== 'number' || isNaN(profit_amount)) {
      return res.status(400).json({ message: "Invalid profit amount" });
    }

    // ถ้าไม่มี work_type ใส่มา ให้ใช้ ALL IN เป็นค่า default
    const workTypeToUse = work_type || "ALL IN";

    // Find the appropriate rank for the profit amount and work type
    const rank = await prisma.commission_rank.findFirst({
      where: {
        work_type: workTypeToUse,
        min_amount: { lte: profit_amount },
        max_amount: { gte: profit_amount },
      },
    });

    if (!rank) {
      return res.status(404).json({
        message: `No commission rank found for work type "${workTypeToUse}" and profit amount ${profit_amount}`,
        commission: 0,
        work_type: workTypeToUse
      });
    }

    // Calculate commission
    const commission = (profit_amount * rank.percentage) / 100;

    return res.status(200).json({
      rank,
      profit_amount,
      work_type: workTypeToUse,
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
              commission_amount: 200, // Fixed 300 baht per purchase
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

// Get commission status for a specific purchase (both employee and CS)
export const getPurchaseCommissionStatus = async (req: Request, res: Response) => {
  try {
    const { purchaseId } = req.params;

    if (!purchaseId) {
      return res.status(400).json({ success: false, message: "Purchase ID is required" });
    }

    // Get employee commissions
    const employeeCommissions = await prisma.employee_commission.findMany({
      where: { d_purchase_id: purchaseId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get CS department commission
    const csCommission = await prisma.cs_department_commission.findFirst({
      where: { d_purchase_id: purchaseId }
    });

    // Determine overall status
    const hasCommission = employeeCommissions.length > 0 || csCommission !== null;
    const isPaid = hasCommission &&
      (employeeCommissions.length > 0 ? employeeCommissions.every(comm => comm.status === 'saved') : true) &&
      (csCommission ? csCommission.status === 'saved' : true);

    return res.status(200).json({
      success: true,
      data: {
        hasCommission,
        status: isPaid ? 'paid' : (hasCommission ? 'saved' : 'pending'),
        employeeCommissions,
        csCommission
      }
    });
  } catch (error) {
    console.error("Error fetching commission status:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch commission status" });
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
 * Export commission data with CS commission as Excel file
 * @param req Request
 * @param res Response
 * @returns Promise<Response>
 */
export const exportCommissionData = async (req: Request, res: Response): Promise<Response> => {
  try {
    const prisma = new PrismaClient();

    // Get month and year from query parameters
    const month = (req.query.month as string) || 'all';
    const year = (req.query.year as string) || 'all';
    const dateFilterType = (req.query.dateFilterType as string) || 'commission';
    const { status, bookNumber, startDate, endDate } = req.query;

    // Validate date parameters if provided
    if (startDate && typeof startDate === 'string') {
      const startDateTime = new Date(startDate);
      if (isNaN(startDateTime.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid startDate format. Please use YYYY-MM-DD format.' 
        });
      }
    }

    if (endDate && typeof endDate === 'string') {
      const endDateTime = new Date(endDate);
      if (isNaN(endDateTime.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid endDate format. Please use YYYY-MM-DD format.' 
        });
      }
    }

    // ไม่จำเป็นต้องตรวจสอบว่ามีค่าหรือไม่ เพราะเรากำหนดค่าเริ่มต้นเป็น 'all' แล้ว
    let purchases: any[] = [];
    let csCommissions: any[] = [];

    // ตรวจสอบว่าต้องการกรองตามเดือนและปีหรือไม่
    const filterByDate = month !== 'all' && year !== 'all';
    
    // Validate month and year if filtering by date
    let monthNum = 0;
    let yearNum = 0;
    
    if (filterByDate) {
      monthNum = parseInt(month);
      yearNum = parseInt(year);
      
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ 
          error: 'Invalid month. Please provide a value between 1-12.' 
        });
      }
      
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        return res.status(400).json({ 
          error: 'Invalid year. Please provide a valid year.' 
        });
      }

      // Filter by specific month and year based on commission creation date, not purchase date
      if (dateFilterType === 'booking') {
        // กรองตามวันที่ทำใบจอง (d_purchase.createdAt)
        const query = `
          SELECT 
            p.id, p.book_number, p.d_term, p.createdAt,
            c.cus_fullname,
            u.fullname as sales_person,
            ec.id as employee_commission_id, ec.commission_type, ec.commission_value, ec.commission_amount, ec.status as employee_status, ec.createdAt as commission_date,
            cs.id as cs_commission_id, cs.commission_amount as cs_commission_amount, cs.is_paid as cs_is_paid,
            pf.billing_amount, fpd.profit_loss, fpd.management_fee as management_fee,
            fpd.net_profit
          FROM d_purchase p
          LEFT JOIN employee_commissions ec ON p.id = ec.d_purchase_id
          LEFT JOIN cs_department_commissions cs ON p.id = cs.d_purchase_id
          LEFT JOIN customer c ON p.customer_id = c.id
          LEFT JOIN d_purchase_emp dpe ON p.id = dpe.d_purchase_id
          LEFT JOIN user u ON dpe.user_id = u.id
          LEFT JOIN purchase_finance pf ON p.id = pf.d_purchase_id
          LEFT JOIN purchase_finance_payment fpd ON pf.id = fpd.purchase_finance_id
          WHERE p.deletedAt IS NULL 
            AND pf.payment_status = 'ชำระครบแล้ว'
            AND pf.deletedAt IS NULL
            AND MONTH(p.createdAt) = ? 
            AND YEAR(p.createdAt) = ?
          ORDER BY ec.createdAt DESC, p.createdAt DESC
        `;
        purchases = await prisma.$queryRawUnsafe(query, monthNum, yearNum);
      } else {
        // กรองตามวันที่บันทึกคอมมิชชั่น (employee_commission.createdAt)
        const query = `
          SELECT 
            p.id, p.book_number, p.d_term, p.createdAt,
            c.cus_fullname,
            u.fullname as sales_person,
            ec.id as employee_commission_id, ec.commission_type, ec.commission_value, ec.commission_amount, ec.status as employee_status, ec.createdAt as commission_date,
            cs.id as cs_commission_id, cs.commission_amount as cs_commission_amount, cs.is_paid as cs_is_paid,
            pf.billing_amount, fpd.profit_loss, fpd.management_fee as management_fee,
            fpd.net_profit
          FROM d_purchase p
          LEFT JOIN employee_commissions ec ON p.id = ec.d_purchase_id
          LEFT JOIN cs_department_commissions cs ON p.id = cs.d_purchase_id
          LEFT JOIN customer c ON p.customer_id = c.id
          LEFT JOIN d_purchase_emp dpe ON p.id = dpe.d_purchase_id
          LEFT JOIN user u ON dpe.user_id = u.id
          LEFT JOIN purchase_finance pf ON p.id = pf.d_purchase_id
          LEFT JOIN purchase_finance_payment fpd ON pf.id = fpd.purchase_finance_id
          WHERE p.deletedAt IS NULL 
            AND pf.payment_status = 'ชำระครบแล้ว'
            AND pf.deletedAt IS NULL
            AND MONTH(ec.createdAt) = ? 
            AND YEAR(ec.createdAt) = ?
          ORDER BY ec.createdAt DESC, p.createdAt DESC
        `;
        purchases = await prisma.$queryRawUnsafe(query, monthNum, yearNum);
      }

      // Get CS department commissions with date filtering based on CS commission creation date
      const csCommissionsQuery = `
        SELECT 
          cs.id,
          cs.d_purchase_id,
          cs.commission_amount,
          cs.is_paid,
          cs.status,
          cs.paid_date,
          cs.createdAt,
          cs.updatedAt,
          'CS' as cs_person,
          p.createdAt as purchase_created_at
        FROM cs_department_commissions cs
        JOIN d_purchase p ON cs.d_purchase_id = p.id
        WHERE MONTH(cs.createdAt) = ? AND YEAR(cs.createdAt) = ?
      `;
      csCommissions = await prisma.$queryRawUnsafe(csCommissionsQuery, monthNum, yearNum);
    } else {
      // Get all data without date filtering
      const query = `
        SELECT 
          p.id, p.book_number, p.d_term, p.createdAt,
          c.cus_fullname,
          u.fullname as sales_person,
          ec.id as employee_commission_id, ec.commission_type, ec.commission_value, ec.commission_amount, ec.status as employee_status, ec.createdAt as commission_date,
          cs.id as cs_commission_id, cs.commission_amount as cs_commission_amount, cs.is_paid as cs_is_paid,
          pf.billing_amount, fpd.profit_loss, fpd.management_fee as management_fee,
          fpd.net_profit
        FROM d_purchase p
        LEFT JOIN employee_commissions ec ON p.id = ec.d_purchase_id
        LEFT JOIN cs_department_commissions cs ON p.id = cs.d_purchase_id
        LEFT JOIN customer c ON p.customer_id = c.id
        LEFT JOIN d_purchase_emp dpe ON p.id = dpe.d_purchase_id
        LEFT JOIN user u ON dpe.user_id = u.id
        LEFT JOIN purchase_finance pf ON p.id = pf.d_purchase_id
        LEFT JOIN purchase_finance_payment fpd ON pf.id = fpd.purchase_finance_id
        WHERE ec.id IS NOT NULL OR cs.id IS NOT NULL
        ORDER BY ec.createdAt DESC, p.createdAt DESC
      `;
      purchases = await prisma.$queryRawUnsafe(query);

      // Get all CS department commissions without date filtering
      const csCommissionsQuery = `
        SELECT 
          cs.id,
          cs.d_purchase_id,
          cs.commission_amount,
          cs.is_paid,
          cs.status,
          cs.paid_date,
          cs.createdAt,
          cs.updatedAt,
          'CS' as cs_person,
          p.createdAt as purchase_created_at
        FROM cs_department_commissions cs
        JOIN d_purchase p ON cs.d_purchase_id = p.id
        WHERE cs.deletedAt IS NULL
      `;
      csCommissions = await prisma.$queryRawUnsafe(csCommissionsQuery);
    }

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Commission Data');

    // Define columns
    worksheet.columns = [
      { header: 'เดือน', key: 'month', width: 10 },
      { header: 'เลขที่ตู้', key: 'containerNumber', width: 15 },
      { header: 'ลูกค้า', key: 'customer', width: 20 },
      { header: 'ประเภทตู้', key: 'containerType', width: 15 },
      { header: 'กำไรขาดทุน', key: 'profitLoss', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'ค่าบริหาร', key: 'adminFee', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'กำไรสุทธิ', key: 'netProfit', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'ประเภทคอมมิชชั่น', key: 'commissionType', width: 15 },
      { header: 'เปอร์เซ็นต์', key: 'commissionPercentage', width: 12 },
      { header: 'คอมมิชชั่น (บาท)', key: 'commissionAmount', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'SALE', key: 'salesPerson', width: 15 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, size: 11 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }  // Light blue background
    };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Set border for header
    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data to the worksheet
    (purchases as any[]).forEach((purchase: any, index: number) => {
      // Extract data from raw query result
      const profit = parseFloat(purchase.profit_loss?.toString() || '0');
      const adminFee = parseFloat(purchase.management_fee?.toString() || '0');
      const netProfit = profit - adminFee; // คำนวณกำไรสุทธิ = กำไรขาดทุน - ค่าบริหาร

      // Get employee commission amount
      const employeeCommissionAmount = purchase.commission_amount ?
        parseFloat(purchase.commission_amount.toString() || '0') : 0;

      const commissionType = purchase.commission_type || 'percentage';
      const commissionValue = purchase.commission_value ?
        parseFloat(purchase.commission_value.toString() || '0') : 0;

      // แยกการแสดงผลตามประเภทคอมมิชชั่น
      let commissionPercentageDisplay = '';

      if (commissionType === 'percentage') {
        // แสดงเปอร์เซ็นต์ที่ชัดเจน เช่น 5%, 3%, 10%
        commissionPercentageDisplay = `${commissionValue.toFixed(1)}%`;
      } else if (commissionType === 'fixed') {
        // แสดง "คงที่" สำหรับคอมมิชชั่นแบบคงที่
        commissionPercentageDisplay = 'คงที่';
      } else {
        // กรณีไม่มีข้อมูล
        commissionPercentageDisplay = '-';
      }

      // ใช้วันที่คอมมิชชั่นแทนวันที่สร้างใบจอง
      const commissionDate = purchase.commission_date ? new Date(purchase.commission_date) :
        (purchase.createdAt ? new Date(purchase.createdAt) : new Date());
      const thaiMonth = format(commissionDate, 'MM/yyyy');

      // Add row to worksheet
      const row = worksheet.addRow({
        month: thaiMonth,
        containerNumber: purchase.book_number || '',
        customer: purchase.cus_fullname || '',
        containerType: purchase.d_term || '',
        profitLoss: profit,
        adminFee: adminFee,
        netProfit: netProfit,
        commissionType: commissionType,
        commissionPercentage: commissionPercentageDisplay,
        commissionAmount: employeeCommissionAmount,
        salesPerson: purchase.sales_person || 'ADMIN'
      });

      // Style the row
      row.eachCell({ includeEmpty: true }, (cell) => {
        // Add borders to each cell
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Center align text cells based on column index
        const columnIndex = cell.col;
        const columnKey = worksheet.getColumn(columnIndex).key || '';

        if (['month', 'containerNumber', 'containerType', 'commissionType', 'commissionPercentage', 'salesPerson'].includes(columnKey)) {
          cell.alignment = { horizontal: 'center' };
        }

        // Right align number cells
        if (['profitLoss', 'adminFee', 'netProfit', 'commissionAmount'].includes(columnKey)) {
          cell.alignment = { horizontal: 'right' };
        }
      });

      // Alternate row colors for better readability
      if (index % 2 === 1) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' }  // Light gray background
          };
        });
      }
    });

    // Format numbers for all numeric columns
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {  // Skip header row
        ['profitLoss', 'adminFee', 'netProfit', 'commissionAmount'].forEach(key => {
          const cell = row.getCell(worksheet.getColumn(key).number);
          if (cell.value !== null && cell.value !== undefined) {
            cell.numFmt = '#,##0.00';
          }
        });
      }
    });

    // Generate dynamic title based on filter parameters
    let excelTitle = 'รายงานคอมมิชชั่น';
    
    if (filterByDate) {
      // Format month with leading zero and year
      const monthStr = monthNum.toString().padStart(2, '0');
      const yearStr = yearNum.toString();
      excelTitle += ` ประจำเดือน ${monthStr}/${yearStr}`;
    } else {
      excelTitle += ' ทั้งหมด';
    }

    // Add title above the table
    worksheet.insertRow(1, [excelTitle]);
    worksheet.mergeCells('A1:K1');
    const titleCell = worksheet.getCell('A1');
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };

    // Remove duplicate CS commission query - already queried above

    // Get unique sales persons and their total commissions
    const salesSummary: { [key: string]: number } = {};
    (purchases as any[]).forEach((purchase: any) => {
      const salesPerson = purchase.sales_person || 'ADMIN';
      const commission = purchase.commission_amount ?
        parseFloat(purchase.commission_amount.toString() || '0') : 0;

      if (!salesSummary[salesPerson]) {
        salesSummary[salesPerson] = 0;
      }
      salesSummary[salesPerson] += commission;
    });

    // Debug log for CS commissions
    console.log('CS Commissions data:', csCommissions);
    console.log('CS Commissions count:', (csCommissions as any[]).length);

    // Get unique CS persons and their total commissions
    const csSummary: { [key: string]: number } = {};
    (csCommissions as any[]).forEach((commission: any) => {
      const csPerson = commission.cs_person || 'CS';
      const commissionAmount = commission.commission_amount ?
        parseFloat(commission.commission_amount.toString() || '0') : 0;

      console.log(`CS Commission: ${csPerson} = ${commissionAmount}`);

      if (!csSummary[csPerson]) {
        csSummary[csPerson] = 0;
      }
      csSummary[csPerson] += commissionAmount;
    });

    console.log('CS Summary:', csSummary);

    // Add empty rows after data for better separation
    const lastDataRow = worksheet.rowCount;
    worksheet.addRow([]);
    worksheet.addRow([]);

    // เพิ่มแถวว่างเพื่อแบ่งส่วน
    worksheet.addRow([]);

    // 1. สร้างส่วนหัวข้อ "เซลล์"
    const saleHeaderRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
    saleHeaderRow.getCell(1).value = 'เซลล์';

    // จัดรูปแบบส่วนหัวข้อ
    saleHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFBFBFBF' }  // สีพื้นหลังเทา
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true };
    });

    // 2. สร้างแถวข้อมูลพนักงานขายและคอมมิชชั่น
    Object.entries(salesSummary).forEach(([salesPerson, commission]) => {

      // กำหนดสีพื้นหลังตามประเภทพนักงาน
      const rowColor = salesPerson === 'ADMIN' ? 'FFFF0000' : // สีแดงสำหรับ ADMIN
        salesPerson === 'POND' ? 'FF00FF00' : // สีเขียวสำหรับ POND
          'FFBFBFBF'; // สีเทาสำหรับคนอื่นๆ

      const salesRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);

      // ใส่ข้อมูลพนักงานและคอมมิชชั่น
      salesRow.getCell(1).value = salesPerson;
      salesRow.getCell(3).value = commission;
      salesRow.getCell(3).numFmt = '#,##0.00';

      // ใส่สีพื้นหลังให้เซลล์ชื่อพนักงาน
      salesRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowColor }
      };

      // เพิ่มเส้นขอบให้ทุกเซลล์ในแถว
      salesRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // จัดตำแหน่งข้อความ
      salesRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      salesRow.getCell(1).font = { bold: true };
      salesRow.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
    });

    // เพิ่มแถวว่างเพื่อแบ่งส่วน
    worksheet.addRow([]);
    worksheet.addRow([]);

    // ===== ส่วนที่ 1: สรุปผลรวมคอมมิชชั่นพนักงานขาย =====

    // สร้างส่วนสรุปผลรวมของ Sales
    const salesSummaryHeaderRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
    salesSummaryHeaderRow.getCell(1).value = 'สรุปผลรวมคอมมิชชั่นพนักงานขาย';
    salesSummaryHeaderRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFBDD7EE' } // สีพื้นหลังฟ้าอ่อน
    };

    // รวมเซลล์ในส่วนหัวข้อ
    const salesSummaryHeaderRowNum = worksheet.rowCount;
    worksheet.mergeCells(`A${salesSummaryHeaderRowNum}:D${salesSummaryHeaderRowNum}`);

    // เพิ่มเส้นขอบให้ทุกเซลล์ในแถว
    salesSummaryHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true, size: 12 };
    });

    // คำนวณยอดรวมคอมมิชชั่นของพนักงานขายทั้งหมด
    const totalSalesCommission = Object.values(salesSummary).reduce((sum, commission) => sum + commission, 0);

    // คำนวณผลรวมกำไรสุทธิทั้งหมด
    const totalNetProfit = (purchases as any[]).reduce((sum, purchase) => {
      const netProfit = purchase.net_profit ?
        parseFloat(purchase.net_profit.toString() || '0') : 0;
      return sum + netProfit;
    }, 0);

    // สร้างแถวข้อมูลยอดรวมของ Sales
    const salesTotalRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
    salesTotalRow.getCell(1).value = 'ยอดรวมคอมมิชชั่นพนักงานขาย';
    salesTotalRow.getCell(3).value = totalSalesCommission;
    salesTotalRow.getCell(3).numFmt = '#,##0.00';
    salesTotalRow.getCell(5).value = 'ยอดรวมกำไรสุทธิ';
    salesTotalRow.getCell(7).value = totalNetProfit;
    salesTotalRow.getCell(7).numFmt = '#,##0.00';

    // เพิ่มเส้นขอบและจัดรูปแบบแถวข้อมูลยอดรวม
    salesTotalRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    salesTotalRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    salesTotalRow.getCell(1).font = { bold: true };
    salesTotalRow.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
    salesTotalRow.getCell(3).font = { bold: true };
    salesTotalRow.getCell(5).alignment = { horizontal: 'left', vertical: 'middle' };
    salesTotalRow.getCell(5).font = { bold: true };
    salesTotalRow.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
    salesTotalRow.getCell(7).font = { bold: true };

    // รวมเซลล์ในส่วนข้อมูล
    const salesTotalRowNum = worksheet.rowCount;
    worksheet.mergeCells(`A${salesTotalRowNum}:B${salesTotalRowNum}`);
    worksheet.mergeCells(`E${salesTotalRowNum}:F${salesTotalRowNum}`);

    // ===== ส่วนที่ 2: สรุปผลรวมคอมมิชชั่น CS =====

    // เพิ่มแถวว่างเพื่อแบ่งส่วน
    worksheet.addRow([]);
    worksheet.addRow([]);

    // สร้างส่วนสรุปผลรวมของ CS
    const csSummaryHeaderRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
    csSummaryHeaderRow.getCell(5).value = 'สรุปผลรวมคอมมิชชั่น CS';
    csSummaryHeaderRow.getCell(5).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2EFDA' } // สีพื้นหลังเขียวอ่อน
    };

    // รวมเซลล์ในส่วนหัวข้อ
    const csSummaryHeaderRowNum = worksheet.rowCount;
    worksheet.mergeCells(`E${csSummaryHeaderRowNum}:H${csSummaryHeaderRowNum}`);

    // เพิ่มเส้นขอบให้ทุกเซลล์ในแถว
    csSummaryHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true, size: 12 };
    });

    // คำนวณยอดรวมคอมมิชชั่นของ CS ทั้งหมด
    const totalCSCommission = Object.values(csSummary).reduce((sum, commission) => sum + commission, 0);

    // สร้างแถวข้อมูลยอดรวมของ CS
    const csTotalRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
    csTotalRow.getCell(5).value = 'ยอดรวมคอมมิชชั่น CS';
    csTotalRow.getCell(7).value = totalCSCommission;
    csTotalRow.getCell(7).numFmt = '#,##0.00';

    // เพิ่มเส้นขอบและจัดรูปแบบแถวข้อมูลยอดรวม
    csTotalRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    csTotalRow.getCell(5).alignment = { horizontal: 'left', vertical: 'middle' };
    csTotalRow.getCell(5).font = { bold: true };
    csTotalRow.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
    csTotalRow.getCell(7).font = { bold: true };

    // รวมเซลล์ในส่วนข้อมูล
    const csTotalRowNum = worksheet.rowCount;
    worksheet.mergeCells(`E${csTotalRowNum}:F${csTotalRowNum}`);

    // ===== ส่วนที่ 3: สรุปผลรวมคอมมิชชั่น Sale Support =====

    // เพิ่มแถวว่างเพื่อแบ่งส่วน
    worksheet.addRow([]);
    worksheet.addRow([]);

    // สร้างส่วนสรุปสำหรับ Sale Support
    const saleSupportHeaderRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
    saleSupportHeaderRow.getCell(1).value = 'สรุปคอมมิชชั่น Sale Support';
    saleSupportHeaderRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFCE4D6' } // สีพื้นหลังส้มอ่อน
    };

    // รวมเซลล์ในส่วนหัวข้อ
    const saleSupportHeaderRowNum = worksheet.rowCount;
    worksheet.mergeCells(`A${saleSupportHeaderRowNum}:D${saleSupportHeaderRowNum}`);

    // เพิ่มเส้นขอบให้ทุกเซลล์ในแถว
    saleSupportHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true, size: 12 };
    });

    // คำนวณยอดรวมคอมมิชชั่นของ Sale Support
    const saleSupCommission = totalSalesCommission * 0.05;

    // สร้างแถวข้อมูล Sale Support
    const saleSupportRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
    saleSupportRow.getCell(1).value = 'Sale Support';
    saleSupportRow.getCell(3).value = saleSupCommission;
    saleSupportRow.getCell(3).numFmt = '#,##0.00';
    saleSupportRow.getCell(4).value = '5%';

    // เพิ่มเส้นขอบและจัดรูปแบบแถวข้อมูล
    saleSupportRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    saleSupportRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    saleSupportRow.getCell(1).font = { bold: true };
    saleSupportRow.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
    saleSupportRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };

    // เพิ่มแถวว่างเพื่อแบ่งส่วน
    worksheet.addRow([]);
    worksheet.addRow([]);

    // ===== เพิ่มตารางแสดงข้อมูล commission_role =====

    // ดึงข้อมูล commission_role จากฐานข้อมูล
    const commissionRoles = await prisma.commission_role.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        role_name: 'asc'
      }
    });

    // สร้างส่วนหัวข้อตาราง commission_role
    const roleHeaderRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
    roleHeaderRow.getCell(1).value = 'ตารางแสดงค่าคอมมิชชั่นตามบทบาท';
    roleHeaderRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFD966' } // สีพื้นหลังเหลือง
    };

    // รวมเซลล์ในส่วนหัวข้อ
    const roleHeaderRowNum = worksheet.rowCount;
    worksheet.mergeCells(`A${roleHeaderRowNum}:D${roleHeaderRowNum}`);

    // เพิ่มเส้นขอบให้ทุกเซลล์ในแถว
    roleHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true, size: 12 };
    });

    // สร้างแถวหัวข้อคอลัมน์
    const roleColumnHeaderRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
    roleColumnHeaderRow.getCell(1).value = 'บทบาท';
    roleColumnHeaderRow.getCell(2).value = 'เปอร์เซ็นต์';
    roleColumnHeaderRow.getCell(3).value = 'คำนวณจากค่าคอมมิชชั่น';
    roleColumnHeaderRow.getCell(4).value = 'คอมมิชชั่น';

    // จัดรูปแบบแถวหัวข้อคอลัมน์
    roleColumnHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' } // สีพื้นหลังเทาอ่อน
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true };
    });

    // เพิ่มข้อมูลแต่ละบทบาท
    let totalRoleCommission = 0;

    // ใช้เฉพาะค่าคอมมิชชั่นของ sale ทั้งหมดในการคำนวณ
    const commissionForCalculation = totalSalesCommission;

    commissionRoles.forEach((role, index) => {
      const commissionPercentage = parseFloat(role.commission_percentage.toString());
      const calculatedCommission = (commissionForCalculation * commissionPercentage) / 100;
      totalRoleCommission += calculatedCommission;

      const roleRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
      roleRow.getCell(1).value = role.role_name;
      roleRow.getCell(2).value = `${commissionPercentage}%`;
      roleRow.getCell(3).value = commissionForCalculation;
      roleRow.getCell(4).value = calculatedCommission;

      // จัดรูปแบบแถวข้อมูล
      roleRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Alternate row colors for better readability
      if (index % 2 === 1) {
        roleRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' }  // Light gray background
          };
        });
      }

      roleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      roleRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      roleRow.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
      roleRow.getCell(3).numFmt = '#,##0.00';
      roleRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
      roleRow.getCell(4).numFmt = '#,##0.00';
    });

    // สร้างแถวผลรวม
    const roleTotalRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
    roleTotalRow.getCell(1).value = 'รวมค่าคอมมิชชั่นทั้งหมด';
    roleTotalRow.getCell(4).value = totalRoleCommission;

    // จัดรูปแบบแถวผลรวม
    roleTotalRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    roleTotalRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    roleTotalRow.getCell(1).font = { bold: true };
    roleTotalRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
    roleTotalRow.getCell(4).numFmt = '#,##0.00';
    roleTotalRow.getCell(4).font = { bold: true };

    // รวมเซลล์ในส่วนผลรวม
    const roleTotalRowNum = worksheet.rowCount;
    worksheet.mergeCells(`A${roleTotalRowNum}:C${roleTotalRowNum}`);

    // เพิ่มแถวเปรียบเทียบกับยอดขายรวม
    const rolePercentRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
    rolePercentRow.getCell(1).value = 'คิดเป็นเปอร์เซ็นต์จากค่าคอมมิชชั่นรวม';
    rolePercentRow.getCell(4).value = totalSalesCommission > 0 ?
      `${(totalRoleCommission / totalSalesCommission * 100).toFixed(2)}%` : '0%';

    // จัดรูปแบบแถวเปอร์เซ็นต์
    rolePercentRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    rolePercentRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    rolePercentRow.getCell(1).font = { bold: true };
    rolePercentRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
    rolePercentRow.getCell(4).font = { bold: true };

    // รวมเซลล์ในส่วนเปอร์เซ็นต์
    const rolePercentRowNum = worksheet.rowCount;
    worksheet.mergeCells(`A${rolePercentRowNum}:C${rolePercentRowNum}`);

    // Generate dynamic filename based on filter parameters
    let filename = 'รายงานคอมมิชชั่น';
    
    if (filterByDate) {
      // Format month with leading zero and Thai year
      const monthStr = monthNum.toString().padStart(2, '0');
      const yearStr = yearNum.toString();
      filename += `_ประจำเดือน_${monthStr}_${yearStr}`;
    } else {
      filename += '_ทั้งหมด';
    }
    
    filename += '.xlsx';

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);

    // Write to buffer and send response
    const buffer = await workbook.xlsx.writeBuffer();
    return res.send(buffer);

  } catch (error) {
    console.error('Error exporting commission data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export commission data'
    });
  }
};

/**
 * Get commission summary data for export as Excel file
 * @param req Request
 * @param res Response
 * @returns Promise<Response>
 */
// Bulk commission calculation for multiple purchases
export const bulkCalculateCommission = async (req: Request, res: Response) => {
  try {
    const { purchase_ids } = req.body;

    if (!Array.isArray(purchase_ids) || purchase_ids.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "กรุณาระบุรายการที่ต้องการคำนวณค่าคอมมิชชั่น" 
      });
    }

    const results = [];
    const errors = [];

    // Process each purchase
    for (const purchaseId of purchase_ids) {
      try {
        // Get purchase data with finance information
        const purchase = await prisma.d_purchase.findUnique({
          where: { id: purchaseId },
          include: {
            purchase_finance: {
              where: {
                payment_status: "ชำระครบแล้ว",
                deletedAt: null
              },
              include: {
                payment_prefix: true
              }
            },
            d_purchase_emp: {
              include: {
                user: true
              }
            }
          }
        });

        if (!purchase) {
          errors.push({ purchaseId, error: "ไม่พบข้อมูลการจอง" });
          continue;
        }

        if (!purchase.purchase_finance || purchase.purchase_finance.length === 0) {
          errors.push({ purchaseId, error: "ไม่พบข้อมูลการเงินที่ชำระครบแล้ว" });
          continue;
        }

        const finance = purchase.purchase_finance[0];
        const profitLoss = parseFloat(finance.payment_prefix?.profit_loss?.toString() || "0");
        const managementFee = parseFloat(finance.payment_prefix?.management_fee?.toString() || "0");
        const workType = purchase.d_term || "ALL IN";

        // Calculate commission for each employee
        const employeeCommissions: any[] = [];
        
        if (purchase.d_purchase_emp && purchase.d_purchase_emp.length > 0) {
          // Find commission rank based on profit and work type
          const rank = await prisma.commission_rank.findFirst({
            where: {
              work_type: workType,
              min_amount: { lte: profitLoss },
              max_amount: { gte: profitLoss },
            },
          });

          const percentageValue = rank ? rank.percentage : 5; // Default 5% if no rank found

          for (const emp of purchase.d_purchase_emp) {
            // Check if it's CS employee (simplified check)
            const isCS = emp.user?.email?.toLowerCase().includes('cs') || false;

            const commissionData = {
              employee_id: emp.user_id,
              commission_type: isCS ? "fixed" : "percentage",
              commission_value: isCS ? 200 : percentageValue,
              commission_amount: isCS ? 200 : (profitLoss * percentageValue) / 100,
              status: "saved"
            };

            employeeCommissions.push(commissionData);
          }
        }

        // Save commission data
        await prisma.$transaction(async (tx) => {
          // Delete existing commissions for this purchase
          await tx.employee_commission.deleteMany({
            where: { d_purchase_id: purchaseId }
          });

          // Create new commission records
          if (employeeCommissions.length > 0) {
            await Promise.all(
              employeeCommissions.map(async (comm) => {
                return await tx.employee_commission.create({
                  data: {
                    d_purchase_id: purchaseId,
                    employee_id: comm.employee_id,
                    commission_type: comm.commission_type,
                    commission_value: comm.commission_value,
                    commission_amount: comm.commission_amount,
                    status: comm.status
                  }
                });
              })
            );
          }

          // Create CS department commission (fixed 200 baht)
          const existingCsCommission = await tx.cs_department_commission.findUnique({
            where: { d_purchase_id: purchaseId }
          });

          if (!existingCsCommission) {
            await tx.cs_department_commission.create({
              data: {
                d_purchase_id: purchaseId,
                commission_amount: 200,
                is_paid: false,
                status: "saved"
              }
            });
          }
        });

        results.push({
          purchaseId,
          success: true,
          commissionsCount: employeeCommissions.length,
          totalCommission: employeeCommissions.reduce((sum, comm) => sum + comm.commission_amount, 0)
        });

      } catch (error) {
        console.error(`Error processing purchase ${purchaseId}:`, error);
        errors.push({ 
          purchaseId, 
          error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ" 
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `ประมวลผลสำเร็จ ${results.length} รายการ`,
      data: {
        successful: results,
        errors: errors,
        summary: {
          total: purchase_ids.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error("Error in bulk commission calculation:", error);
    return res.status(500).json({ 
      success: false,
      message: "เกิดข้อผิดพลาดในการคำนวณค่าคอมมิชชั่น" 
    });
  }
};

export const getCommissionSummaryForExport = async (req: Request, res: Response) => {
  try {
    const { 
      employeeId, 
      startDate, 
      endDate 
    } = req.query;

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
                payment_status: "ชำระครบแล้ว",
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
      { header: 'เปอร์เซ็นต์', key: 'commissionValue', width: 15 },
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
      const commissionAmount = commission.commission_amount ? parseFloat(commission.commission_amount?.toString() || '0') : 0;

      employee.totalCommission += commissionAmount;

      // Get finance data
      const financeData = commission.d_purchase?.purchase_finance[0];
      const billingAmount = financeData?.billing_amount ? parseFloat(financeData.billing_amount?.toString() || '0') : 0;
      const profit = financeData?.profit_loss ? parseFloat(financeData.profit_loss?.toString() || '0') : 0;

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
      const commissionAmount = commission.commission_amount ? parseFloat(commission.commission_amount?.toString() || '0') : 0;
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
