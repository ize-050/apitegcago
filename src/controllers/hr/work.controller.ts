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
      const workType = req.query.workType as string;
      const bookNumber = req.query.bookNumber as string;
      const employeeId = req.query.employeeId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const dateFilterType = req.query.dateFilterType as string;

      const skip = (page - 1) * limit;

      // Build filter conditions
      let whereConditions: any = {
        deletedAt: null,
      };

      // Default filter for purchase_finance (always apply)
      whereConditions.purchase_finance = {
        some: {
          deletedAt: null,
          payment_status: "ชำระครบแล้ว",
        },
      };

      // Build employee_commission filter con ditions
      let employeeCommissionFilter: any = {};
      let useORCondition = false;

      // Add commission status filter
      if (status && status !== "all") {
        if (status.toUpperCase() === 'PENDING') {
          // Show purchases without commission or commission status not "SAVED"
          // This requires OR condition, so we'll handle it separately
          useORCondition = true;
        } else if (status.toUpperCase() === 'PAID') {
          // Show purchases with commission status "SAVED"
          employeeCommissionFilter.status = "SAVED";
        }
      }

      // Date filtering
      if (startDate || endDate) {
        const commissionDateFilter: any = {};

        if (startDate) {
          const startDateTime = new Date(startDate);
          // ตรวจสอบว่า Date object ถูกต้องหรือไม่
          if (isNaN(startDateTime.getTime())) {
            return res.status(400).json({ 
              error: 'Invalid startDate format. Please use YYYY-MM-DD format.' 
            });
          }
          commissionDateFilter.gte = startDateTime;
        }

        if (endDate) {
          const endDateTime = new Date(endDate);
          // ตรวจสอบว่า Date object ถูกต้องหรือไม่
          if (isNaN(endDateTime.getTime())) {
            return res.status(400).json({ 
              error: 'Invalid endDate format. Please use YYYY-MM-DD format.' 
            });
          }
          // Set time to end of day for endDate
          endDateTime.setHours(23, 59, 59, 999);
          commissionDateFilter.lte = endDateTime;
        }

        // ตรวจสอบว่ามี date filter หรือไม่ก่อนใช้งาน
        if (Object.keys(commissionDateFilter).length > 0) {
          if (dateFilterType === 'booking') {
            // Use accounting close date (purchase_finance.updatedAt) for booking filter
            whereConditions.purchase_finance = {
              ...whereConditions.purchase_finance,
              some: {
                ...whereConditions.purchase_finance.some,
                updatedAt: commissionDateFilter
              }
            };
          } else if (dateFilterType === 'commission') {
            employeeCommissionFilter.createdAt = commissionDateFilter;
          } else {
            // Default: use accounting close date (purchase_finance.updatedAt)
            whereConditions.purchase_finance = {
              ...whereConditions.purchase_finance,
              some: {
                ...whereConditions.purchase_finance.some,
                updatedAt: commissionDateFilter
              }
            };
          }
        }
      }

      // Apply filters based on commission status
      if (useORCondition && status?.toUpperCase() === 'PENDING') {
        // For PENDING status, we need OR condition
        const orConditions: any[] = [
          { employee_commission: { none: {} } }
        ];

        // If we have date filter, add it to the pending condition
        if (Object.keys(employeeCommissionFilter).length > 0) {
          orConditions.push({
            employee_commission: {
              some: {
                status: { not: "SAVED" },
                ...employeeCommissionFilter
              }
            }
          });
        } else {
          orConditions.push({
            employee_commission: {
              some: {
                status: { not: "SAVED" }
              }
            }
          });
        }

        whereConditions.OR = orConditions;
      } else if (Object.keys(employeeCommissionFilter).length > 0) {
        // For PAID status or date filter only
        whereConditions.employee_commission = {
          some: employeeCommissionFilter,
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

      // Add search condition if provided
      if (search) {
        whereConditions.OR = [
          { book_number: { contains: search } },
          { customer: { customer_emp: { contains: search } } },
          { d_origin: { contains: search } },
          { d_destination: { contains: search } },
        ];
      }

      // Add work type filter if provided
      if (workType) {
        whereConditions.d_term = {
          equals: workType,
        };
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
            include: {
              payment_prefix: {
                select: {
                  id: true,
                  management_fee: true,
                  profit_loss: true,
                }
              }
            }
          },
          employee_commission: {
            select: {
              id: true,
              commission_type: true,
              commission_value: true,
              commission_amount: true,
              status: true,
              employee_id: true,
              createdAt: true,
              updatedAt: true,
            }
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
        commissions: item.employee_commission.map(commission => ({
          id: commission.id,
          commission_type: commission.commission_type,
          commission_value: commission.commission_value,
          commission_amount: commission.commission_amount,
          status: commission.status,
          employee_id: commission.employee_id,
          createdAt: commission.createdAt,
          updatedAt: commission.updatedAt,
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
