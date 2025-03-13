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
    if (type) {
      const typeValue = type.toString();
      if (typeValue === 'DEPOSIT') {
        where.customerDepositId = { not: null };
      } else if (typeValue === 'PURCHASE' || typeValue === 'TOPUP') {
        where.exchangeId = { not: null };
        where.exchange = {
          type: typeValue
        };
      }
    }

    // Search by document number
    if (searchTerm) {
      where.OR = [
        { documentNumber: { contains: searchTerm.toString() } },
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
