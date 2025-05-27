import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class HRDashboardController {
  /**
   * Get monthly commission data for dashboard
   */
  public async getMonthlyCommission(req: Request, res: Response) {
    try {
      const { year } = req.query;
      
      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'ต้องระบุปี',
        });
      }

      // Query to get monthly commission data
      const monthlyCommissionData = await prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(p.createdAt, '%m') as month,
          SUM(ec.commission_amount) as totalCommission
        FROM d_purchase p
        LEFT JOIN employee_commissions ec ON ec.d_purchase_id = p.id
        WHERE  YEAR(p.createdAt) = ${year}
        GROUP BY month
        ORDER BY month
      `;

      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลค่าคอมมิชชั่นรายเดือนสำเร็จ',
        data: monthlyCommissionData,
      });
    } catch (error: any) {
      console.error('Error fetching monthly commission data:', error);
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลค่าคอมมิชชั่นรายเดือน',
        error: error.message,
      });
    }
  }

  /**
   * Get commission data by type for dashboard
   */
  public async getCommissionByType(req: Request, res: Response) {
    try {
      const { year } = req.query;
      
      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'ต้องระบุปี',
        });
      }

      // Query to get commission data by type
      const commissionByTypeData = await prisma.$queryRaw`
        SELECT 
          p.d_term as type,
          SUM(ec.commission_amount) as totalCommission
        FROM d_purchase p
        LEFT JOIN employee_commissions ec ON ec.d_purchase_id = p.id
        WHERE YEAR(p.createdAt) = ${year}
        GROUP BY type
        ORDER BY totalCommission DESC
      `;

      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลค่าคอมมิชชั่นตามประเภทสำเร็จ',
        data: commissionByTypeData,
      });
    } catch (error: any) {
      console.error('Error fetching commission by type data:', error);
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลค่าคอมมิชชั่นตามประเภท',
        error: error.message,
      });
    }
  }

  /**
   * Get sales commission data for dashboard
   */
  public async getSalesCommission(req: Request, res: Response) {
    try {
      const { year } = req.query;
      
      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'ต้องระบุปี',
        });
      }

      // Query to get sales commission data
      const salesCommissionData = await prisma.$queryRaw`
        SELECT 
          u.fullname,
          SUM(ec.commission_amount) as totalCommission
        FROM employee_commissions ec
        JOIN user u ON ec.employee_id = u.id
        JOIN d_purchase p ON ec.d_purchase_id = p.id

        WHERE YEAR(p.createdAt) = ${year}
        GROUP BY u.id, u.fullname
        ORDER BY totalCommission DESC
      `;

      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลค่าคอมมิชชั่นตามพนักงานขายสำเร็จ',
        data: salesCommissionData,
      });
    } catch (error: any) {
      console.error('Error fetching sales commission data:', error);
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลค่าคอมมิชชั่นตามพนักงานขาย',
        error: error.message,
      });
    }
  }
}
