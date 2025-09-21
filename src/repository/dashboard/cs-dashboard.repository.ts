import { prisma } from "../../lib/prisma";
import moment from "moment";

export class CSDashboardRepository {
  /**
   * Get CS KPIs - คำขอใหม่, ตีราคา, เสนอราคา, รับงาน
   */
  async getCSKPIs(filters: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const { startDate, endDate } = filters;
      
      console.log('KPI Filters:', { startDate, endDate });
      
      // Base date filter
      const dateFilter = startDate && endDate ? {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      } : {};

      console.log('Date Filter:', dateFilter);

      // คำขอใหม่จากฝ่ายขาย (Sale ตีราคา)
      const newRequests = await prisma.d_purchase.count({
        where: {
          d_status: 'Sale ตีราคา',
          deletedAt: null,
          ...dateFilter
        }
      });

      // ตีราคา (Cs เสนอราคา)
      const quotations = await prisma.d_purchase.count({
        where: {
          d_status: 'Cs เสนอราคา',
          deletedAt: null,
          ...dateFilter
        }
      });

      // เสนอราคา (Financial) - ใช้ Cs เสนอราคา แทน
      const proposals = await prisma.d_purchase.count({
        where: {
          d_status: 'Cs เสนอราคา',
          deletedAt: null,
          ...dateFilter
        }
      });

      // รับงาน (Cs รับงาน)
      const acceptedJobs = await prisma.d_purchase.count({
        where: {
          d_status: 'Cs รับงาน',
          deletedAt: null,
          ...dateFilter
        }
      });

      const result = {
        newRequests,
        quotations,
        proposals,
        acceptedJobs
      };
      
      console.log('KPI Results:', result);
      
      return result;
    } catch (error: any) {
      throw new Error(`getCSKPIs error: ${error.message}`);
    }
  }

  /**
   * Get Shipment Analysis - 5 ส่วนวิเคราะห์
   */
  async getShipmentAnalysis(filters: {
    startDate?: string;
    endDate?: string;
    transport?: string;
    route?: string;
    term?: string;
  }): Promise<any> {
    try {
      const { startDate, endDate, transport, route, term } = filters;
      
      const dateFilter = startDate && endDate ? {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      } : {};

      const whereCondition: any = {
        deletedAt: null,
        ...dateFilter
      };

      if (transport) whereCondition.d_transport = transport;
      if (route) whereCondition.d_route = route;
      if (term) whereCondition.d_term = term;

      // Route Analysis
      const routeData = await prisma.d_purchase.groupBy({
        by: ['d_route'],
        where: {
          deletedAt: null,
          d_route: { not: null },
          ...dateFilter
        },
        _count: {
          id: true
        }
      });

      // Transport Analysis
      const transportData = await prisma.d_purchase.groupBy({
        by: ['d_transport'],
        where: {
          deletedAt: null,
          d_transport: { not: null },
          ...dateFilter
        },
        _count: {
          id: true
        }
      });

      // Term Analysis
      const termData = await prisma.d_purchase.groupBy({
        by: ['d_term'],
        where: {
          deletedAt: null,
          d_term: { not: null },
          ...dateFilter
        },
        _count: {
          id: true
        }
      });

      // Group Work Analysis
      const groupWorkData = await prisma.d_purchase.groupBy({
        by: ['d_group_work'],
        where: {
          deletedAt: null,
          d_group_work: { not: null },
          ...dateFilter
        },
        _count: {
          id: true
        }
      });

      // Job Type Combination
      const jobTypeData = await prisma.d_purchase.groupBy({
        by: ['d_route', 'd_transport', 'd_term'],
        where: {
          deletedAt: null,
          d_route: { not: null },
          d_transport: { not: null },
          d_term: { not: null },
          ...dateFilter
        },
        _count: {
          id: true
        }
      });

      const result = {
        routeAnalysis: routeData.map(item => ({
          route: item.d_route,
          count: item._count.id
        })),
        transportAnalysis: transportData.map(item => ({
          transport: item.d_transport,
          count: item._count.id
        })),
        termAnalysis: termData.map(item => ({
          term: item.d_term,
          count: item._count.id
        })),
        groupWorkAnalysis: groupWorkData.map(item => ({
          groupWork: item.d_group_work,
          count: item._count.id
        })),
        jobTypeAnalysis: jobTypeData.map(item => ({
          jobType: `${item.d_route}-${item.d_transport}-${item.d_term}`,
          route: item.d_route,
          transport: item.d_transport,
          term: item.d_term,
          count: item._count.id
        }))
      };
      
      console.log('Shipment Analysis Result:', result);
      return result;
    } catch (error: any) {
      throw new Error(`getShipmentAnalysis error: ${error.message}`);
    }
  }

  /**
   * Get Port Analysis - ท่าเรือต้นทางและปลายทาง
   */
  async getPortAnalysis(filters: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const { startDate, endDate } = filters;
      
      const dateFilter = startDate && endDate ? {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      } : {};

      // Origin Ports
      const originData = await prisma.d_purchase.groupBy({
        by: ['d_origin'],
        where: {
          AND: [
            { deletedAt: null },
            { d_origin: { not: null } },
            { d_origin: { not: { in: ['', '-'] } } },
            dateFilter
          ]
        },
        _count: {
          id: true
        }
      });

      // Destination Ports
      const destinationData = await prisma.d_purchase.groupBy({
        by: ['d_destination'],
        where: {
          AND: [
            { deletedAt: null },
            { d_destination: { not: null } },
            { d_destination: { not: { in: ['', '-'] } } },
            dateFilter
          ]
        },
        _count: {
          id: true
        }
      });

      // Combined Port Analysis with Route
      const portRouteData = await prisma.d_purchase.groupBy({
        by: ['d_origin', 'd_destination', 'd_route'],
        where: {
          AND: [
            { deletedAt: null },
            { d_origin: { not: null } },
            { d_origin: { not: { in: ['', '-'] } } },
            { d_destination: { not: null } },
            { d_destination: { not: { in: ['', '-'] } } },
            { d_route: { not: null } },
            { d_route: { not: { in: ['', '-'] } } },
            dateFilter
          ]
        },
        _count: {
          id: true
        }
      });

      const result = {
        originPorts: originData.map(item => ({
          port: item.d_origin,
          count: item._count.id
        })),
        destinationPorts: destinationData.map(item => ({
          port: item.d_destination,
          count: item._count.id
        })),
        portRouteAnalysis: portRouteData.map(item => ({
          origin: item.d_origin,
          destination: item.d_destination,
          route: item.d_route,
          count: item._count.id
        }))
      };
      
      console.log('Port Analysis Result:', result);
      return result;
    } catch (error: any) {
      throw new Error(`getPortAnalysis error: ${error.message}`);
    }
  }

  /**
   * Get Product Type Analysis - ประเภทสินค้า
   */
  async getProductTypeAnalysis(filters: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const { startDate, endDate } = filters;
      
      const dateFilter = startDate && endDate ? {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      } : {};

      const productData = await prisma.d_product.groupBy({
        by: ['d_product_name'],
        where: {
          deletedAt: null,
          d_product_name: { not: null },
          d_purchase: {
            deletedAt: null,
            ...dateFilter
          }
        },
        _count: {
          id: true
        }
      });

      return productData.map(item => ({
        productName: item.d_product_name,
        count: item._count.id
      }));
    } catch (error: any) {
      throw new Error(`getProductTypeAnalysis error: ${error.message}`);
    }
  }

  /**
   * Get CS Status Tracking - สถานะต่างๆ ของ CS ทั้งหมด
   */
  async getCSStatusTracking(filters: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const { startDate, endDate } = filters;
      
      const dateFilter = startDate && endDate ? {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      } : {};

      // Get all CS Status from cs_purchase table with date filter
      // Use raw SQL to properly handle the join and date filtering
      const statusQuery = `
        SELECT cp.status_key, cp.status_name, COUNT(*) as count
        FROM cs_purchase cp
        LEFT JOIN d_purchase dp ON cp.d_purchase_id = dp.id
        WHERE cp.deletedAt IS NULL AND dp.deletedAt IS NULL
        AND dp.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'
        GROUP BY cp.status_key, cp.status_name
        ORDER BY cp.status_key ASC
      `;

      const allStatusData = await prisma.$queryRawUnsafe(statusQuery) as Array<{
        status_key: string;
        status_name: string;
        count: number;
      }>;

      // Map all status data to consistent format
      const statusMapping = allStatusData.reduce((acc: Record<string, { statusKey: string; statusName: string; count: number }>, item: any) => {
        if (item.status_key) {
          acc[item.status_key] = {
            statusKey: item.status_key,
            statusName: item.status_name || '',
            count: Number(item.count)
          };
        }
        return acc;
      }, {} as Record<string, { statusKey: string; statusName: string; count: number }>);

      // Return all CS statuses with proper structure
      return {
        // Individual status categories (for backward compatibility)
        containerStatus: [
          statusMapping['Bookcabinet'] || { statusKey: 'Bookcabinet', statusName: 'จองตู้', count: 0 }
        ],
        documentStatus: [
          statusMapping['Document'] || { statusKey: 'Document', statusName: 'จัดทำเอกสาร', count: 0 }
        ],
        departureStatus: [
          statusMapping['Leave'] || { statusKey: 'Leave', statusName: 'ออกเดินทาง', count: 0 },
          statusMapping['Departure'] || { statusKey: 'Departure', statusName: 'ยืนยันวันออกเดินทาง', count: 0 }
        ],
        deliveryStatus: [
          statusMapping['Destination'] || { statusKey: 'Destination', statusName: 'จัดส่งปลายทาง', count: 0 },
          statusMapping['SentSuccess'] || { statusKey: 'SentSuccess', statusName: 'ส่งเรียบร้อย', count: 0 }
        ],
        
        // All CS statuses for comprehensive display
        allStatuses: [
          statusMapping['Bookcabinet'] || { statusKey: 'Bookcabinet', statusName: 'จองตู้', count: 0 },
          statusMapping['Contain'] || { statusKey: 'Contain', statusName: 'บรรจุตู้', count: 0 },
          statusMapping['Document'] || { statusKey: 'Document', statusName: 'จัดทำเอกสาร', count: 0 },
          statusMapping['Receive'] || { statusKey: 'Receive', statusName: 'รับตู้', count: 0 },
          statusMapping['Departure'] || { statusKey: 'Departure', statusName: 'ยืนยันวันออกเดินทาง', count: 0 },
          statusMapping['Leave'] || { statusKey: 'Leave', statusName: 'ออกเดินทาง', count: 0 },
          statusMapping['WaitRelease'] || { statusKey: 'WaitRelease', statusName: 'รอตรวจปล่อย', count: 0 },
          statusMapping['Released'] || { statusKey: 'Released', statusName: 'ตรวจปล่อยเรียบร้อย', count: 0 },
          statusMapping['Destination'] || { statusKey: 'Destination', statusName: 'จัดส่งปลายทาง', count: 0 },
          statusMapping['SentSuccess'] || { statusKey: 'SentSuccess', statusName: 'ส่งเรียบร้อย', count: 0 },
          statusMapping['Etc'] || { statusKey: 'Etc', statusName: 'หมายเหตุ', count: 0 }
        ],
        
        // Summary totals
        totalJobs: allStatusData.reduce((sum: number, item: any) => sum + Number(item.count), 0),
        statusBreakdown: allStatusData.map((item: any) => ({
          statusKey: item.status_key,
          statusName: item.status_name,
          count: Number(item.count)
        }))
      };
    } catch (error: any) {
      throw new Error(`getCSStatusTracking error: ${error.message}`);
    }
  }

  /**
   * Get Available Filters - ตัวเลือกสำหรับ filter
   */
  async getAvailableFilters(): Promise<any> {
    try {
      // Transport options
      const transportOptions = await prisma.d_purchase.findMany({
        where: { deletedAt: null },
        select: { d_transport: true },
        distinct: ['d_transport']
      });

      // Route options
      const routeOptions = await prisma.d_purchase.findMany({
        where: { deletedAt: null },
        select: { d_route: true },
        distinct: ['d_route']
      });

      // Term options
      const termOptions = await prisma.d_purchase.findMany({
        where: { deletedAt: null },
        select: { d_term: true },
        distinct: ['d_term']
      });

      return {
        transportOptions: transportOptions.map(item => item.d_transport).filter(Boolean),
        routeOptions: routeOptions.map(item => item.d_route).filter(Boolean),
        termOptions: termOptions.map(item => item.d_term).filter(Boolean)
      };
    } catch (error: any) {
      throw new Error(`getAvailableFilters error: ${error.message}`);
    }
  }
}
