import { PrismaClient, withdrawalInformaion } from "@prisma/client";
import moment from "moment";
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

//interface 

import { FinanceInterface } from "../../services/finance/dto/finance.interface"
import { PurchaseFinanceDataInterface } from "../../services/finance/dto/purchaseFinanceData.interface"

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
          purchase_finance: true,
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
        },
        include: {
          d_purchase:true,
          china_expenses: true,
          thailand_expenses: true,
          shipping_details: true,
          payment_details:true,
          payment_prefix:true,
          
        }
      });

      console.log("work", work)
      
      if (!work) {
        return null;
      }
      
      // ดึงข้อมูลการชำระเงินแต่ละรายการ
      const paymentDetails = await this.getPaymentDetailsByPurchaseId(work.id);
      
      // รวมข้อมูลทั้งหมดเข้าด้วยกัน
      const result: any = {
        ...work,
        ...work.d_purchase,
        
        // ข้อมูลการชำระเงินแต่ละรายการ
        payment_details: paymentDetails || [],
        
        // ข้อมูลค่าใช้จ่ายจีน
        ...(work.china_expenses || {}),
        
        // ข้อมูลค่าใช้จ่ายไทย
        ...(work.thailand_expenses || {}),
        
        // ข้อมูล Shipping
        ...(work.shipping_details || {})
      };
      
      // ลบข้อมูลซ้ำซ้อน
      if ('d_purchase' in result) {
        delete result.d_purchase;
      }
      
      return result;
    }
    catch (err: any) {
      console.error("Error in getWorkByid:", err);
      throw err
    }
  }

  public async getWidhdrawalInformationByShipmentNumber(d_shipment_number: string): Promise<any> {
    try {
      const withdrawalInformation = await this.prisma.withdrawalInformaion.findFirst({
        where: {
          invoice_package: d_shipment_number
        },
      });
      return withdrawalInformation;
    } catch (err: any) {
      console.error("Error in getWidhdrawalInformationByShipmentNumber:", err);
      throw err;
    }
  }

  public async submitPurchase(data: any): Promise<any> {
    try{
      // บันทึกข้อมูลหลักของการชำระเงิน
      const purchaseFinance = await this.prisma.purchase_finance.create({
        data: {
          ...data
        }
      });
      
      return purchaseFinance;
    }
    catch(error){
      console.error("Error in submitPurchase:", error);
      throw error;
    }
  }


  // เพิ่มฟังก์ชันสำหรับจัดการข้อมูลการชำระเงิน
public async createPaymentDetail(data: any) {
  try {
      console.log('Creating payment detail:', data);
      console.log('Payment detail data:', data);
      return await this.prisma.finance_payment_detail.create({
          data: {
              purchase_finance_id: data.purchase_finance_id,
              payment_date: data.payment_date,
              payment_amount: data.payment_amount,
              remaining_amount: data.remaining_amount
          }
      });
  } catch (error) {
      console.error('Error in createPaymentDetail:', error);
      throw error;
  }
}

public async deletePaymentDetails(purchaseFinanceId: string) {
  try {
      return await this.prisma.finance_payment_detail.deleteMany({
          where: {
              purchase_finance_id: purchaseFinanceId
          }
      });
  } catch (error) {
      console.error('Error in deletePaymentDetails:', error);
      throw error;
  }
}

public async getPaymentDetailsByPurchaseId(purchaseFinanceId: string) {
  try {
      return await this.prisma.finance_payment_detail.findMany({
          where: {
              purchase_finance_id: purchaseFinanceId
          },
          orderBy: {
              id: 'asc'
          }
      });
  } catch (error) {
      console.error('Error in getPaymentDetailsByPurchaseId:', error);
      throw error;
  }
}

  public async getPurchaseFinanceById(id: string): Promise<any> {
    try {
      const purchaseFinance = await this.prisma.purchase_finance.findUnique({
        where: {
          id: id
        }
      });
      
      return purchaseFinance;
    } catch (error) {
      console.error('Error in getPurchaseFinanceById:', error);
      throw error;
    }
  }

  public async updatePurchase(id: string, data: any): Promise<any> {
    try{
      // อัพเดทข้อมูลหลักของการซื้อ
      const purchaseFinance = await this.prisma.purchase_finance.update({
        where: {
          id: id
        },
        data: {
          ...data
        }
      });
      
      return purchaseFinance;
    }
    catch(error){
      console.error("Error in updatePurchase:", error);
      throw error;
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

  public async submitWidhdrawalInformation(withdrawalData: any): Promise<any> {
    try {
      // Extract the main data and withdrawal items from the request
      const { withdrawalItems, ...mainData } = withdrawalData;

      // Generate a unique group_id for this submission
      const groupId = uuidv4();

      // Calculate total gasoline and other costs from individual items
      const totalGasolineCost = withdrawalItems.reduce(
        (sum: number, item: any) => sum + Number(item.gasoline_cost || 0),
        0
      );
      
      const totalOtherCost = withdrawalItems.reduce(
        (sum: number, item: any) => sum + Number(item.other_cost || 0),
        0
      );
      
      // คำนวณยอดรวมการเบิกทั้งหมด
      const totalWithdrawalAmount = withdrawalItems.reduce(
        (sum: number, item: any) => sum + Number(item.withdrawal_amount || 0),
        0
      );
      
      // คำนวณยอดคงเหลือจากยอดโอน - ยอดเบิกรวม
      const transferAmount = Number(mainData.transfer_amount || 0);
      const remainingAmount = transferAmount - totalWithdrawalAmount;

      // Create records for each withdrawal item
      const createdRecords = await Promise.all(
        withdrawalItems.map(async (item: any) => {
          return await this.prisma.withdrawalInformaion.create({
            data: {
              d_purchase_id: mainData.d_purchase_id || '',
              group_id: groupId,
              withdrawal_date: mainData.withdrawal_date || '',
              withdrawal_person: mainData.withdrawal_person || '',
              withdrawal_amount: item.withdrawal_amount || '',
              invoice_package: item.invoice_package || '',
              consignee: item.consignee || '',
              head_tractor: item.head_tractor || '',
              transfer_amount: mainData.transfer_amount || '',
              transfer_date: mainData.transfer_date || '',
              return_people: mainData.return_people || '',
              withdrawal_company: mainData.withdrawal_company || '',
              
              // Store individual gasoline and other costs for each item
              pay_gasoline: item.gasoline_cost?.toString() || '0',
              pay_price: item.other_cost?.toString() || '0',
              
              // Calculate the total for this item
              pay_total: (
                Number(item.withdrawal_amount || 0) - 
                Number(item.gasoline_cost || 0) - 
                Number(item.other_cost || 0)
              ).toString()
            }
          });
        })
      );

      // Create a summary record with total gasoline and other costs
      // This record will not have specific withdrawal item details
      await this.prisma.withdrawalInformaion.create({
        data: {
          d_purchase_id: mainData.d_purchase_id || '',
          group_id: groupId,
          withdrawal_date: mainData.withdrawal_date || '',
          withdrawal_person: mainData.withdrawal_person || '',
          transfer_amount: mainData.transfer_amount || '',
          transfer_date: mainData.transfer_date || '',
          return_people: mainData.return_people || '',
          withdrawal_company: mainData.withdrawal_company || '',
          
          // Store the total gasoline and other costs
          pay_gasoline: totalGasolineCost.toString(),
          pay_price: totalOtherCost.toString(),
          
          // ยอดคงเหลือ (ยอดโอน - ยอดเบิกรวม)
          pay_total: remainingAmount.toString(),
          
          // Mark this as a summary record
          invoice_package: 'SUMMARY_RECORD'
        }
      });

      return {
        groupId,
        records: createdRecords,
        totalWithdrawalAmount,
        totalGasolineCost,
        totalOtherCost,
        transferAmount,
        remainingAmount
      };
    } catch (error) {
      console.error('Error in submitWidhdrawalInformation:', error);
      throw error;
    }
  }

  public async updateWidhdrawalInformation(Request: Partial<any>): Promise<any> {
    try {
      // Extract withdrawal items and main data from the request
      const { withdrawalItems, ...mainData } = Request;
      
      // Use existing group_id
      const groupId = mainData.group_id;
      
      if (!groupId) {
        throw new Error("Group ID is required for updating withdrawal information");
      }
      
      // Calculate total gasoline and other costs from all items
      const totalGasolineCost = withdrawalItems.reduce(
        (sum: number, item: any) => sum + Number(item.gasoline_cost || 0),
        0
      );
      
      const totalOtherCost = withdrawalItems.reduce(
        (sum: number, item: any) => sum + Number(item.other_cost || 0),
        0
      );
      
      // คำนวณยอดรวมการเบิกทั้งหมด
      const totalWithdrawalAmount = withdrawalItems.reduce(
        (sum: number, item: any) => sum + Number(item.withdrawal_amount || 0),
        0
      );
      
      // คำนวณยอดคงเหลือจากยอดโอน - ยอดเบิกรวม
      const transferAmount = Number(mainData.transfer_amount || 0);
      const remainingAmount = transferAmount - totalWithdrawalAmount;
      
      // Get existing records for this group
      const existingRecords = await this.prisma.withdrawalInformaion.findMany({
        where: {
          group_id: groupId
        }
      });
      
      // Separate regular records and summary record
      const existingSummaryRecord = existingRecords.find(record => record.invoice_package === 'SUMMARY_RECORD');
      const existingRegularRecords = existingRecords.filter(record => record.invoice_package !== 'SUMMARY_RECORD');
      
      // Use transaction to ensure all updates are atomic
      return await this.prisma.$transaction(async (prisma) => {
        const updatedRecords = [];
        
        // Update or create records for each withdrawal item
        for (let i = 0; i < withdrawalItems.length; i++) {
          const item = withdrawalItems[i];
          const existingRecord = existingRegularRecords[i];
          
          const recordData = {
            d_purchase_id: mainData.d_purchase_id || '',
            group_id: groupId,
            withdrawal_date: mainData.withdrawal_date || '',
            withdrawal_person: mainData.withdrawal_person || '',
            withdrawal_amount: item.withdrawal_amount || '',
            invoice_package: item.invoice_package || '',
            consignee: item.consignee || '',
            head_tractor: item.head_tractor || '',
            transfer_amount: mainData.transfer_amount || '',
            transfer_date: mainData.transfer_date || '',
            return_people: mainData.return_people || '',
            
            // Store individual gasoline and other costs for each item
            pay_gasoline: item.gasoline_cost?.toString() || '0',
            pay_price: item.other_cost?.toString() || '0',
            
            // คำนวณยอดคงเหลือของแต่ละรายการตามแบบเดียวกับเส้น create
            pay_total: (
              Number(item.withdrawal_amount || 0) - 
              Number(item.gasoline_cost || 0) - 
              Number(item.other_cost || 0)
            ).toString()
          };
          
          let updatedRecord;
          
          if (existingRecord) {
            // Update existing record
            updatedRecord = await prisma.withdrawalInformaion.update({
              where: { id: existingRecord.id },
              data: recordData
            });
          } else {
            // Create new record if there are more items than before
            updatedRecord = await prisma.withdrawalInformaion.create({
              data: recordData
            });
          }
          
          updatedRecords.push(updatedRecord);
        }
        
        // If there are more existing records than new items, delete the extra records
        if (existingRegularRecords.length > withdrawalItems.length) {
          const recordsToDelete = existingRegularRecords.slice(withdrawalItems.length);
          
          for (const record of recordsToDelete) {
            await prisma.withdrawalInformaion.delete({
              where: { id: record.id }
            });
          }
        }
        
        // Update or create summary record
        const summaryData = {
          d_purchase_id: mainData.d_purchase_id || '',
          group_id: groupId,
          withdrawal_date: mainData.withdrawal_date || '',
          withdrawal_person: mainData.withdrawal_person || '',
          transfer_amount: mainData.transfer_amount || '',
          transfer_date: mainData.transfer_date || '',
          return_people: mainData.return_people || '',
          
          // Store the total gasoline and other costs
          pay_gasoline: totalGasolineCost.toString(),
          pay_price: totalOtherCost.toString(),
          
          // ยอดคงเหลือ (ยอดโอน - ยอดเบิกรวม)
          pay_total: remainingAmount.toString(),
          
          // Mark this as a summary record
          invoice_package: 'SUMMARY_RECORD'
        };
        
        let updatedSummaryRecord;
        
        if (existingSummaryRecord) {
          // Update existing summary record
          updatedSummaryRecord = await prisma.withdrawalInformaion.update({
            where: { id: existingSummaryRecord.id },
            data: summaryData
          });
        } else {
          // Create new summary record if it doesn't exist
          updatedSummaryRecord = await prisma.withdrawalInformaion.create({
            data: summaryData
          });
        }
        
        return {
          groupId,
          records: updatedRecords,
          summaryRecord: updatedSummaryRecord,
          transferAmount,
          totalWithdrawalAmount,
          remainingAmount
        };
      });
      
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
      const deleteWithdrawalInformation = await this.prisma.withdrawalInformaion.delete({
        where: {
          id: id,
        },
      });
      return deleteWithdrawalInformation;
    } catch (err: any) {
      console.log("errdeleteWithdrawalInformation", err);
      throw err;
    }
  }

  public async deleteWithdrawalInformationByGroupId(groupId: string): Promise<any> {
    try {
      // ลบข้อมูลทั้งหมดที่มี group_id เดียวกัน
      const deleteResult = await this.prisma.withdrawalInformaion.deleteMany({
        where: {
          group_id: groupId,
        },
      });
      
      return {
        count: deleteResult.count,
        groupId: groupId
      };
    } catch (err: any) {
      console.log("errDeleteWithdrawalInformationByGroupId", err);
      throw err;
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

  public async getCustomerAccounts(): Promise<any> {
    try {
      const customerAccounts = await this.prisma.finance_customer_account.findMany({
        where: {
          deletedAt: null
        },
        orderBy: {
          finance_name: 'asc'
        },
        select: {
          id: true,
          finance_name: true
        }
      });
      
      return customerAccounts;
    } catch (err: any) {
      console.log("Error fetching customer accounts:", err);
      throw err;
    }
  }

  public async getCompanyAccounts(): Promise<any> {
    try {
      const companyAccounts = await this.prisma.finance_company_account.findMany({
        where: {
          deletedAt: null
        },
        orderBy: {
          company_name: 'asc'
        },
        select: {
          id: true,
          company_name: true,
          bank_name: true,
          bank_account: true
        }
      });
      
      return companyAccounts;
    } catch (err: any) {
      console.log("Error fetching company accounts:", err);
      throw err;
    }
  }

}

export default FinanceRepository;
