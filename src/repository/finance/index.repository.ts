import { PrismaClient, withdrawalInformaion } from "@prisma/client";
import moment from "moment";
import crypto from 'crypto';

//interface 

import { FinanceInterface } from "../../services/finance/dto/finance.interface"

class FinanceRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async getPurchaseBysearch(search: string): Promise<any> {
    try {
      const purchase: any = await this.prisma.d_purchase.findMany({
        where: {
          d_shipment_number: {
            contains: search
          }
        },
        include: {
          cs_purchase: {
            where: {
              status_key: 'Bookcabinet'
            },
            include: {
              bookcabinet: true,
            }
          },
        }
      })
      return purchase
    }
    catch (err: any) {
      console.log("errgetPurchase", err)
      throw err
    }
  }

  public async getPurchase(Request: Partial<any>): Promise<any> {
    try {
      const { page, term, po_number } = Request
      const purchase = await this.prisma.d_purchase.findMany({
        where: {
          d_transport: term,
          d_shipment_number: {
            contains: po_number
          },
          OR: [
            {
              cs_purchase: {
                some: {
                  status_name: "ออกเดินทาง"
                }
              }
            },
            {
              d_status: {
                in: ["ปิดการขาย", "ค้างชำระเงิน", "ลูกค้าเครดิต"]
              },
            }
          ]
        },
        skip: (page - 1) * 10,
        take: 10,
        include: {
          cs_purchase: {
            where: {
              status_name: "ออกเดินทาง"
            }
          },
          purchase_finance: true
        }
      })

      const total = await this.prisma.d_purchase.count({
        where: {
          OR: [
            {
              cs_purchase: {
                some: {
                  status_name: "ออกเดินทาง"
                }
              }
            },
            {
              d_status: {
                in: ["ปิดการขาย", "ค้างชำระเงิน", "ลูกค้าเครดิต"]
              },
            }
          ]
        }
      })


      return {
        purchase,
        total
      }
    }
    catch (err: any) {
      throw err
    }
  }


  public async getPurchaseById(id: string): Promise<any> {
    try {
      const purchase = await this.prisma.d_purchase.findUnique({
        where: {
          id: id
        },
        include: {
          d_purchase_customer_payment: true,
          d_purchase_emp: {
            include: {
              user: true
            }
          },
          cs_purchase: {
            where: {
              status_key: {
                in: ["Leave", "return_cabinet"]
              }
            },
            include: {
              leave: true,
              cs_return_cabinet: true,
              bookcabinet: true,

            },
          }
        },

      })


      return purchase
    } catch (err: any) {
      console.log("errgetPurchaseById", err)
      throw err
    }
  }

  public async getWorkByid(d_purchase_id: string): Promise<any> {
    try {
      const work = await this.prisma.purchase_finance.findFirst({
        where: {
          d_purchase_id: d_purchase_id
        }
      })
      return work
    }
    catch (err: any) {
      throw err;
    }
  }

  public async submitPurchase(Request: FinanceInterface): Promise<any> {
    try {

      console.log("Rqwqeqwewq", Request.id)

      if (typeof Request.id === "undefined") {
        const data = Request;
        delete data.id;
        const purchase = await this.prisma.purchase_finance.create({
          data: {
            ...data
          }
        })

        return purchase;
      }
      else {
        const purchase = await this.prisma.purchase_finance.update({
          where: {
            id: Request.id
          },
          data: {
            ...Request
          }
        })
        return purchase
      }
    } catch (err: any) {
      console.log("errsubmitPurchase", err)
      throw err
    }
  }


  public async updatePurchase(id: string, Request: FinanceInterface): Promise<any> {
    try {
      if (Request.d_purchase_id == null) {
        return null
      }

      const purchase = await this.prisma.purchase_finance.update({
        where: {
          id: id
        },
        data: {
          ...Request
        }
      })
      return purchase
    } catch (err: any) {
      console.log("errupdatePurchase", err)
      throw err
    }
  }

  public async getWidhdrawalInformation(Request: Partial<any>): Promise<any> {
    try {
      console.log("Request params:", Request);
      
      // Build where conditions
      const where: any = {};
      
      // Add date range filter if provided
      if (Request.startDate || Request.endDate) {
        where.withdrawal_date = {};
        
        if (Request.startDate) {
          where.withdrawal_date.gte = Request.startDate;
        }
        
        if (Request.endDate) {
          // Add one day to include the end date fully
          const nextDay = new Date(Request.endDate);
          nextDay.setDate(nextDay.getDate() + 1);
          where.withdrawal_date.lte = nextDay.toISOString().split('T')[0];
        }
      }
      
      // Add search filter if provided
      if (Request.search) {
        where.invoice_package = {
          contains: Request.search
        };
      }
      
      // Get all withdrawal records with filters
      const widhdrawalInformation = await this.prisma.withdrawalInformaion.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log("Found withdrawal records:", widhdrawalInformation.length);

      // Get total count
      const total = await this.prisma.withdrawalInformaion.count({ where });

      return {
        widhdrawalInformation,
        total
      };
    } catch (err: any) {
      console.log("errgetWidhdrawalInformation", err);
      throw err
    }
  }

  public async CheckWidhdrawalInformation(Request: Partial<any>): Promise<any> {
    try {
      const widhdrawalInformation = await this.prisma.withdrawalInformaion.findMany({
        where: {
          invoice_package: Request.invoice_package
        }
      })

      return widhdrawalInformation
    } catch (err: any) {
      console.log("errCheckWidhdrawalInformation", err)
      throw err
    }
  }

  public async submitWidhdrawalInformation(Request: any): Promise<any> {
    try {
      // Extract withdrawal items from the request
      const { withdrawalItems, ...mainData } = Request;
      
      console.log("withdrawalItems received:", withdrawalItems);
      console.log("withdrawalItems length:", withdrawalItems.length);
      console.log("mainData:", mainData);
      
      // Generate a unique group ID to link all related withdrawal records
      const groupId = crypto.randomUUID();
      
      // Calculate the number of items to distribute expenses to
      const itemCount = withdrawalItems.length;
      
      // Only distribute expenses if there are items
      const distributedGasoline = itemCount > 0 ? Number(mainData.pay_gasoline) / itemCount : 0;
      const distributedPrice = itemCount > 0 ? Number(mainData.pay_price) / itemCount : 0;
      
      console.log("distributedGasoline:", distributedGasoline);
      console.log("distributedPrice:", distributedPrice);
      
      // Create multiple withdrawal information records, one for each item
      const createdRecords = await Promise.all(
        withdrawalItems.map(async (item:any) => {
          console.log("Processing item:", item);
          
          return await this.prisma.withdrawalInformaion.create({
            data: {
              ...mainData,
              group_id: groupId,
              invoice_package: item.invoice_package,
              consignee: item.consignee || '',
              head_tractor: item.head_tractor || '',
              withdrawal_date: item.withdrawal_date || '',
              withdrawal_amount: item.withdrawal_amount || '',
              // Distribute the expenses evenly across all items
              pay_gasoline: distributedGasoline.toString(),
              pay_price: distributedPrice.toString(),
              // Calculate the total for each item
              pay_total: (
                Number(item.withdrawal_amount || 0) - 
                distributedGasoline - 
                distributedPrice
              ).toString()
            }
          });
        })
      );

      console.log("Created records:", createdRecords.length);
      
      return {
        groupId,
        records: createdRecords
      };
    } catch (err: any) {
      console.log("errsubmitWidhdrawalInformation", err);
      throw err
    }
  }

  public async updateWidhdrawalInformation(Request: Partial<any>): Promise<any> {
    try {
      // Extract withdrawal items from the request
      const { withdrawalItems, groupId, ...mainData } = Request;
      
      // Calculate the number of items to distribute expenses to
      const itemCount = withdrawalItems.length;
      
      // Only distribute expenses if there are items
      const distributedGasoline = itemCount > 0 ? Number(mainData.pay_gasoline) / itemCount : 0;
      const distributedPrice = itemCount > 0 ? Number(mainData.pay_price) / itemCount : 0;
      
      // First delete all existing withdrawal records with this group ID
      await this.prisma.withdrawalInformaion.deleteMany({
        where: {
          group_id: groupId
        }
      });
      
      // Create new withdrawal information records, one for each item
      const updatedRecords = await Promise.all(
        withdrawalItems.map(async (item:any) => {
          return await this.prisma.withdrawalInformaion.create({
            data: {
              ...mainData,
              group_id: groupId,
              d_purchase_id: item.d_purchase_id,
              invoice_package: item.invoice_package,
              consignee: item.consignee || '',
              head_tractor: item.head_tractor || '',
              withdrawal_date: item.withdrawal_date || '',
              withdrawal_amount: item.withdrawal_amount || '',
              // Distribute the expenses evenly across all items
              pay_gasoline: distributedGasoline.toString(),
              pay_price: distributedPrice.toString(),
              // Calculate the total for each item
              pay_total: (
                Number(item.withdrawal_amount || 0) - 
                distributedGasoline - 
                distributedPrice
              ).toString()
            }
          });
        })
      );
      
      return {
        groupId,
        records: updatedRecords
      };
    } catch (err: any) {
      console.log("errupdateWidhdrawalInformation", err);
      throw err
    }
  }

  public async getWidhdrawalInformationByGroupId(groupId: string): Promise<any> {
    try {
      const records = await this.prisma.withdrawalInformaion.findMany({
        where: {
          group_id: groupId
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return records;
    } catch (err: any) {
      console.log("errgetWidhdrawalInformationByGroupId", err);
      throw err
    }
  }

  public async deleteWithdrawalInformation(id: string): Promise<any> {
    try {
      // Delete only the specific record with the given ID
      const result = await this.prisma.withdrawalInformaion.delete({
        where: {
          id: id
        }
      });

      return result;
    } catch (err: any) {
      console.log("errdeleteWithdrawalInformation", err);
      throw err
    }
  }

  public async createFinancialRecord(data: any): Promise<any> {
    try {
      // Format dates and convert numeric fields
      const formattedData = {
        ...data,
        date: new Date(data.date),
        transferDate: data.transferDate ? new Date(data.transferDate) : new Date(),
        // Convert string numbers to float
        amountRMB: data.amountRMB ? parseFloat(data.amountRMB) : 0,
        amountTHB: data.amountTHB ? parseFloat(data.amountTHB) : null,
        exchangeRate: data.exchangeRate ? parseFloat(data.exchangeRate) : null
      };

      const record = await this.prisma.financial_record.create({
        data: formattedData
      });
      
      return record;
    } catch (error) {
      console.error("Error creating financial record:", error);
      throw error;
    }
  }

  public async getFinancialRecords(filters?: any): Promise<any> {
    try {
      const where: any = {};
      
      // Apply filters if provided
      if (filters) {
        // Filter by type
        if (filters.type && filters.type !== 'all') {
          where.type = filters.type;
        }
        
        // Filter by account owner
        if (filters.account && filters.account !== 'all') {
          where.accountOwner = filters.account;
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
        
        // Filter by search term (title or payTo)
        if (filters.search) {
          where.OR = [
            { title: { contains: filters.search } },
            { payTo: { contains: filters.search } }
          ];
        }
        
      }
      
      const records = await this.prisma.financial_record.findMany({
        where,
        orderBy: {
          date: 'desc'
        }
      });

      console.log("records", where);
      
      return records;
    } catch (error) {
      console.error("Error fetching financial records:", error);
      throw error;
    }
  }

  public async getFinancialRecordById(id: string): Promise<any> {
    try {
      const record = await this.prisma.financial_record.findUnique({
        where: { id }
      });
      
      return record;
    } catch (error) {
      console.error(`Error fetching financial record with ID ${id}:`, error);
      throw error;
    }
  }

  public async updateFinancialRecord(id: string, data: any): Promise<any> {
    try {
      // Format dates and convert numeric fields
      const formattedData = {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        transferDate: data.transferDate ? new Date(data.transferDate) : undefined,
        updatedAt: new Date(),
        // Convert string numbers to float
        amountRMB: data.amountRMB ? parseFloat(data.amountRMB) : undefined,
        amountTHB: data.amountTHB ? parseFloat(data.amountTHB) : undefined,
        exchangeRate: data.exchangeRate ? parseFloat(data.exchangeRate) : undefined
      };

      const record = await this.prisma.financial_record.update({
        where: { id },
        data: formattedData
      });
      
      return record;
    } catch (error) {
      console.error(`Error updating financial record with ID ${id}:`, error);
      throw error;
    }
  }

  public async deleteFinancialRecord(id: string): Promise<any> {
    try {
      // Soft delete by setting deletedAt
      const record = await this.prisma.financial_record.delete({
        where: { id }
      });
      
      return record;
    } catch (error) {
      console.error(`Error deleting financial record with ID ${id}:`, error);
      throw error;
    }
  }

  public async hardDeleteFinancialRecord(id: string): Promise<any> {
    try {
      // Hard delete - use with caution
      const record = await this.prisma.financial_record.delete({
        where: { id }
      });
      
      return record;
    } catch (error) {
      console.error(`Error hard deleting financial record with ID ${id}:`, error);
      throw error;
    }
  }
}

export default FinanceRepository;
