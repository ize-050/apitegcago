import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class HrWorkController {
  /**
   * Get work list for HR that have paid finance status
   * @param req Request
   * @param res Response
   * @returns Promise<Response>
   */
  public async getWorkList(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      const status = req.query.status as string;
      const bookNumber = req.query.bookNumber as string;
      const employeeId = req.query.employeeId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      const skip = (page - 1) * limit;

      // Build filter conditions
      const whereConditions: any = {
        deletedAt: null,
      };

      // Add finance status filter if provided
      if (status && status !== "all") {
        whereConditions.purchase_finance = {
          some: {
            deletedAt: null,
            finance_status: status,
          },
        };
      } else {
        // Default to show all purchases with any finance records
        whereConditions.purchase_finance = {
          some: {
            deletedAt: null,
          },
        };
      }

      // Add booking number filter if provided
      if (bookNumber) {
        whereConditions.book_number = {
          contains: bookNumber,
        };
      }

      // Add employee ID filter if provided
      if (employeeId) {
        whereConditions.d_purchase_emp = {
          some: {
            deletedAt: null,
            is_active: true,
            user_id: employeeId,
          },
        };
      }

      // Add date range filter if provided
      if (startDate || endDate) {
        whereConditions.createdAt = {};
        
        if (startDate) {
          whereConditions.createdAt.gte = new Date(startDate);
        }
        
        if (endDate) {
          // Set time to end of day for endDate
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          whereConditions.createdAt.lte = endDateTime;
        }
      }

      // Add search condition if provided
      if (search) {
        whereConditions.OR = [
          { book_number: { contains: search } },
          { customer: { customer_emp: { contains: search } } }, 
          { d_origin: { contains: search } },
          { d_destination: { contains: search } },
        ];
      }

      // Count total items
      const totalItems = await prisma.d_purchase.count({
        where: whereConditions,
      });

      // Get data with pagination
      const data = await prisma.d_purchase.findMany({
        where: whereConditions,
        include: {
          customer: {
            select: {
              id: true,
              cus_fullname: true,
            },
          },
          purchase_finance: {
            where: {
              deletedAt: null,
            },
          },
          d_purchase_emp: {
            where: {
              deletedAt: null,
              is_active: true,
            },
            include: {
              user: {
                select: {
                  id: true,
                  fullname: true,
                  email: true,
                }
              }
            }
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      });

      // แปลงข้อมูลเพื่อให้ตรงกับ interface ที่ frontend ต้องการ
      const transformedData = data.map(item => ({
        ...item,
        customer: {
          id: item.customer.id,
          cus_fullname: item.customer.cus_fullname,
        },
        employees: item.d_purchase_emp.map(emp => ({
          id: emp.id,
          user_id: emp.user_id,
          fullname: emp.user.fullname,
          email: emp.user.email,
        })),
      }));

      return res.status(200).json({
        success: true,
        message: "Get work list successfully",
        data: transformedData,
        currentPage: page,
        totalItems: totalItems,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      });
    } catch (error: unknown) {
      console.error("Error in getWorkList:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: errorMessage,
      });
    }
  }
}

export default new HrWorkController();
