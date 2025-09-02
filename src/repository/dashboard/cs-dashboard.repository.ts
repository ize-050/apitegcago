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
   * Get CS Status Tracking - สถานะต่างๆ ของ CS
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

      // CS Status Tracking from cs_purchase table
      const statusData = await prisma.cs_purchase.groupBy({
        by: ['status_key', 'status_name'],
        where: {
          deletedAt: null,
          status_active: true,
          d_purchase: {
            deletedAt: null,
            ...dateFilter
          }
        },
        _count: {
          id: true
        }
      });

      // Additional status counts
      const containerStatus = await prisma.bookcabinet.count({
        where: {
          deletedAt: null,
          ...dateFilter
        }
      });

      const departureStatus = await prisma.leave.count({
        where: {
          deletedAt: null,
          ...dateFilter
        }
      });

      const deliveryStatus = await prisma.cs_already_sent.count({
        where: {
          deletedAt: null,
          ...dateFilter
        }
      });

      // CS Status Breakdown
      const csStatusBreakdown = await prisma.cs_purchase.groupBy({
        by: ['status_key', 'status_name'],
        where: {
          deletedAt: null,
          ...dateFilter
        },
        _count: {
          id: true
        }
      });

      return {
        containerStatus: {
          total: containerStatus,
          label: 'สถานะจองตู้'
        },
        documentStatus: {
          total: statusData.filter(s => s.status_key === 'Document').reduce((sum, s) => sum + s._count.id, 0),
          label: 'สถานะจัดทำเอกสาร'
        },
        departureStatus: {
          total: departureStatus,
          label: 'สถานะรออกเดินทาง'
        },
        deliveryStatus: {
          total: deliveryStatus,
          label: 'สถานะจัดส่งปลายทาง'
        },
        statusBreakdown: statusData.map(item => ({
          statusKey: item.status_key,
          statusName: item.status_name,
          count: item._count.id
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
