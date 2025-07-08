import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all transfer data with pagination and filters
export const getAllTransfers = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      employeeId,
      startDate,
      endDate,
      searchTerm,
      type,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter conditions
    const where: any = {
      deletedAt: null,
    };

    // Filter by employee ID if provided
    if (employeeId) {
      where.salespersonId = employeeId.toString();
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate.toString());
      }
      if (endDate) {
        const endDateObj = new Date(endDate.toString());
        endDateObj.setHours(23, 59, 59, 999);
        where.date.lte = endDateObj;
      }
    }

    // Filter by transaction type
   if(type){
     if(type.toString() === 'DEPOSIT' || type.toString() === 'deposit') {
      where.type = 'deposit';
     } else if(type.toString() === 'PURCHASE' || type.toString() === 'purchase') {
      where.type = 'order';
     } else if(type.toString() === 'TOPUP' || type.toString() === 'topup') {
      where.type = 'topup';
     }
    console.log("type", type);
   }

    // Search by document number or customer ID
    if (searchTerm) {
      where.OR = [
        { documentNumber: { contains: searchTerm.toString() } },
        { customerId: { contains: searchTerm.toString() } },
      ];
    }


    // Search by document number or customer ID
    if (searchTerm) {
      where.OR = [
        { documentNumber: { contains: searchTerm.toString() } },
        { customerId: { contains: searchTerm.toString() } },
      ];
    }

    // Get transactions with their related data
    const transactions = await prisma.finance_transaction.findMany({
      where,
      include: {
        customerDeposit: true,
        exchange: true,
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
          }
        }
      },
      skip,
      take: limitNumber,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total count for pagination
    const totalItems = await prisma.finance_transaction.count({ where });
    const totalPages = Math.ceil(totalItems / limitNumber);

    return res.status(200).json({
      success: true,
      data: transactions,
      currentPage: pageNumber,
      totalPages,
      totalItems,
      limit: limitNumber,
    });
  } catch (error) {
    console.error("Error fetching transfer data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transfer data",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Get employees with salesupport role
export const getSalesSupportEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.user.findMany({
      where: {
        roles: {
          roles_name: "Salesupport"
        },
        deletedAt: null
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        roles: {
          select: {
            roles_name: true
          }
        }
      },
      orderBy: {
        fullname: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error("Error fetching salesupport employees:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch salesupport employees",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Update transfer data
export const updateTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      type,
      date,
      documentNumber,
      customerId,
      salespersonId,
      amountRMB,
      transferDate,
      // Customer deposit specific fields
      priceDifference,
      exchangeRate,
      fee,
      amount,
      vat,
      totalWithVat,
      totalDepositAmount,
      receivingAccount,
      notes,
      transferSlipUrl,
      deposit_purpose,
      // Exchange specific fields
      productDetails,
      orderStatus,
      topupPlatform,
      topupAccount,
      exchangeRateProfit,
      incomePerTransaction
    } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transfer ID is required"
      });
    }

    // Check if transfer exists
    const existingTransfer = await prisma.finance_transaction.findUnique({
      where: { id },
      include: {
        customerDeposit: true,
        exchange: true
      }
    });

    if (!existingTransfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found"
      });
    }

    // Update main transfer record
    const updatedTransfer = await prisma.finance_transaction.update({
      where: { id },
      data: {
        type,
        date: date ? new Date(date) : undefined,
        documentNumber,
        customerId,
        salespersonId,
        amountRMB: amountRMB ? parseFloat(amountRMB.toString()) : undefined,
        transferDate: transferDate ? new Date(transferDate) : undefined,
        updatedAt: new Date()
      }
    });

    // Update related customer deposit if exists
    if (existingTransfer.customerDepositId && existingTransfer.customerDeposit) {
      await prisma.finance_customer_deposit.update({
        where: { id: existingTransfer.customerDepositId },
        data: {
          date: date ? new Date(date) : undefined,
          salespersonId,
          documentNumber,
          customerId,
          amountRMB: amountRMB ? parseFloat(amountRMB.toString()) : undefined,
          priceDifference: priceDifference ? parseFloat(priceDifference.toString()) : undefined,
          exchangeRate: exchangeRate ? parseFloat(exchangeRate.toString()) : undefined,
          fee: fee ? parseFloat(fee.toString()) : undefined,
          amount: amount ? parseFloat(amount.toString()) : undefined,
          vat: vat ? parseFloat(vat.toString()) : undefined,
          totalWithVat: totalWithVat ? parseFloat(totalWithVat.toString()) : undefined,
          totalDepositAmount: totalDepositAmount ? parseFloat(totalDepositAmount.toString()) : undefined,
          transferDate: transferDate ? new Date(transferDate) : undefined,
          receivingAccount,
          notes,
          transferSlipUrl,
          deposit_purpose,
          updatedAt: new Date()
        }
      });
    }

    // Update related exchange if exists
    if (existingTransfer.exchangeId && existingTransfer.exchange) {
      await prisma.finance_exchange.update({
        where: { id: existingTransfer.exchangeId },
        data: {
          date: date ? new Date(date) : undefined,
          salespersonId,
          documentNumber,
          customerId,
          type,
          amountRMB: amountRMB ? parseFloat(amountRMB.toString()) : undefined,
          priceDifference: priceDifference ? parseFloat(priceDifference.toString()) : undefined,
          exchangeRate: exchangeRate ? parseFloat(exchangeRate.toString()) : undefined,
          fee: fee ? parseFloat(fee.toString()) : undefined,
          amount: amount ? parseFloat(amount.toString()) : undefined,
          productDetails,
          orderStatus,
          topupPlatform,
          topupAccount,
          receivingAccount,
          exchangeRateProfit: exchangeRateProfit ? parseFloat(exchangeRateProfit.toString()) : undefined,
          incomePerTransaction: incomePerTransaction ? parseFloat(incomePerTransaction.toString()) : undefined,
          transferDate: transferDate ? new Date(transferDate) : undefined,
          notes,
          transferSlipUrl,
          updatedAt: new Date()
        }
      });
    }

    // Fetch updated transfer with relations
    const result = await prisma.finance_transaction.findUnique({
      where: { id },
      include: {
        customerDeposit: true,
        exchange: true,
        user: {
          select: {
            id: true,
            fullname: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Transfer updated successfully",
      data: result
    });

  } catch (error) {
    console.error("Error updating transfer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update transfer",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get single transfer by ID
export const getTransferById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transfer = await prisma.finance_transaction.findUnique({
      where: { id },
      include: {
        customerDeposit: true,
        exchange: true,
        user: {
          select: {
            id: true,
            fullname: true,
            email: true
          }
        }
      }
    });

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: transfer
    });

  } catch (error) {
    console.error("Error fetching transfer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transfer",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
