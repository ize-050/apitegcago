import { PrismaClient } from "@prisma/client";
import { ConsignmentCreateDto, ConsignmentUpdateDto } from "../../services/finance/dto/consignment.interface";

class ConsignmentRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async createConsignment(data: ConsignmentCreateDto): Promise<any> {
    try {
      // Format dates and convert numeric fields
      const formattedData = {
        ...data,
        date: new Date(data.date),
        transferDate: data.transferDate ? new Date(data.transferDate) : new Date(),
        // Convert string numbers to float
        amountRMB: typeof data.amountRMB === 'string' ? parseFloat(data.amountRMB) : data.amountRMB,
      };

      const record = await this.prisma.finance_consignment.create({
        data: formattedData
      });
      
      return record;
    } catch (error) {
      console.error("Error creating consignment record:", error);
      throw error;
    }
  }

  public async getConsignments(filters?: any): Promise<any> {
    try {
      const where: any = {};
      
      // Apply filters if provided
      if (filters) {
        // Filter by type
        if (filters.type && filters.type !== 'all') {
          where.type = filters.type;
        }
        
        // Filter by date range
        if (filters.startDate) {
          where.date = {
            ...(where.date || {}),
            gte: new Date(filters.startDate)
          };
        }
        
        if (filters.endDate) {
          where.date = {
            ...(where.date || {}),
            lte: new Date(filters.endDate)
          };
        }
        
        // Filter by search term (documentNumber or customerId)
        if (filters.search) {
          where.OR = [
            { documentNumber: { contains: filters.search } },
            { customerId: { contains: filters.search } }
          ];
        }
        
        // Filter by salesperson
        if (filters.salespersonId) {
          where.salespersonId = filters.salespersonId;
        }
      }
      
      // Get total count for pagination
      const totalCount = await this.prisma.finance_consignment.count({ where });
      
      // Parse pagination parameters
      const page = filters?.page ? parseInt(filters.page as string) : 1;
      const limit = filters?.limit ? parseInt(filters.limit as string) : 10;
      const skip = (page - 1) * limit;
      
      // Get records with pagination
      const records = await this.prisma.finance_consignment.findMany({
        where,
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limit
      });
      
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        records,
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error("Error fetching consignment records:", error);
      throw error;
    }
  }

  public async getConsignmentById(id: string): Promise<any> {
    try {
      const record = await this.prisma.finance_consignment.findUnique({
        where: { id }
      });
      
      return record;
    } catch (error) {
      console.error(`Error fetching consignment record with ID ${id}:`, error);
      throw error;
    }
  }

  public async updateConsignment(id: string, data: ConsignmentUpdateDto): Promise<any> {
    try {
      // Format dates and convert numeric fields
      const formattedData: any = { ...data };
      
      // Convert date fields if provided
      if (data.date) {
        formattedData.date = new Date(data.date);
      }
      
      if (data.transferDate) {
        formattedData.transferDate = new Date(data.transferDate);
      }
      
      // Add updatedAt timestamp
      formattedData.updatedAt = new Date();
      
      // Convert amountRMB to float if it's a string
      if (typeof data.amountRMB === 'string') {
        formattedData.amountRMB = parseFloat(data.amountRMB);
      }

      const record = await this.prisma.finance_consignment.update({
        where: { id },
        data: formattedData
      });
      
      return record;
    } catch (error) {
      console.error(`Error updating consignment record with ID ${id}:`, error);
      throw error;
    }
  }

  public async deleteConsignment(id: string): Promise<any> {
    try {
      const record = await this.prisma.finance_consignment.delete({
        where: { id }
      });
      
      return record;
    } catch (error) {
      console.error(`Error deleting consignment record with ID ${id}:`, error);
      throw error;
    }
  }
}

export default ConsignmentRepository;
