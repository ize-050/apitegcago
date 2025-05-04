import { prisma } from "../../prisma/prisma-client";
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository สำหรับจัดการข้อมูลรายการเงิน
 */
export class RecordMoneyRepository {
  constructor() {
    // ใช้ prisma singleton แทนการสร้าง PrismaClient ใหม่
  }

  /**
   * ดึงข้อมูลรายการเงินทั้งหมด
   * @returns รายการเงินทั้งหมด
   */
  async getAllRecordMoney() {
    try {
      return await prisma.finance_transaction.findMany({
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          customerDeposit: true,
          exchange: true,
          user: true
        }
      });
    } catch (error) {
      console.error('Error in getAllRecordMoney:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลรายการเงินตาม ID
   * @param id ID ของรายการเงิน
   * @returns รายการเงินที่ต้องการ
   */
  async getRecordMoneyById(id: string) {
    try {
      return await prisma.finance_transaction.findUnique({
        where: { id },
        include: {
          customerDeposit: true,
          exchange: true
        }
      });
    } catch (error) {
      console.error('Error in getRecordMoneyById:', error);
      throw error;
    }
  }

  /**
   * สร้างรายการเงินใหม่
   * @param data ข้อมูลรายการเงิน
   * @returns รายการเงินที่สร้างใหม่
   */
  async createRecordMoney(data: any) {
    try {
      // แยกข้อมูลสำหรับแต่ละตาราง
      const { customerDeposit, exchange, ...recordData } = data;

      // สร้าง ID สำหรับรายการเงินใหม่
      const recordId = uuidv4();

      // สร้างรายการเงินใหม่ในฐานข้อมูล
      const newRecord = await prisma.finance_transaction.create({
        data: {
          id: recordId,
          date: new Date(recordData.date),
          salespersonId: recordData.salesperson,
          documentNumber: recordData.documentNumber,
          customerId: recordData.customerId,
          type: recordData.type,
          deposit_purpose: recordData.deposit_purpose,
          transferSlipUrl: recordData.transferSlipUrl || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          // สร้าง customerDeposit ถ้ามี
          ...(customerDeposit && {
            customerDeposit: {
              create: {
                amountRMB: parseFloat(customerDeposit.amountRMB.toString()),
                priceDifference: parseFloat(customerDeposit.priceDifference.toString()),
                exchangeRate: parseFloat(customerDeposit.exchangeRate.toString()),
                fee: parseFloat(customerDeposit.fee.toString()),
                amount: parseFloat(customerDeposit.amount.toString()),
                vat: parseFloat(customerDeposit.vat.toString()),
                totalWithVat: parseFloat(customerDeposit.totalWithVat.toString()),
                transferDate: new Date(customerDeposit.transferDate),
                receivingAccount: customerDeposit.receivingAccount,
                exchangeRateProfit: parseFloat(customerDeposit.exchangeRateProfit.toString()),
                incomePerTransaction: parseFloat(customerDeposit.incomePerTransaction.toString()),
                totalDepositAmount: parseFloat(customerDeposit.totalDepositAmount.toString()),
                includeVat: customerDeposit.includeVat || false,
                notes: customerDeposit.notes || '',
                formattedAmount: customerDeposit.formattedAmount || '',
                formattedExchangeRateProfit: customerDeposit.formattedExchangeRateProfit || '',
                formattedIncomePerTransaction: customerDeposit.formattedIncomePerTransaction || '',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          }),
          // สร้าง exchange ถ้ามี
          ...(exchange && {
            exchange: {
              create: {
                amountRMB: parseFloat(exchange.amountRMB.toString()),
                priceDifference: parseFloat(exchange.priceDifference.toString()),
                exchangeRate: parseFloat(exchange.exchangeRate.toString()),
                fee: parseFloat(exchange.fee.toString()),
                amount: parseFloat(exchange.amount.toString()),
                transferDate: new Date(exchange.transferDate),
                receivingAccount: exchange.receivingAccount,
                exchangeRateProfit: parseFloat(exchange.exchangeRateProfit.toString()),
                incomePerTransaction: parseFloat(exchange.incomePerTransaction.toString()),
                includeVat: exchange.includeVat || false,
                vatAmount: parseFloat(exchange.vatAmount.toString()),
                totalWithVat: parseFloat(exchange.totalWithVat.toString()),
                notes: exchange.notes || '',
                formattedAmount: exchange.formattedAmount || '',
                formattedExchangeRateProfit: exchange.formattedExchangeRateProfit || '',
                formattedIncomePerTransaction: exchange.formattedIncomePerTransaction || '',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          })
        },
        include: {
          customerDeposit: true,
          exchange: true
        }
      });

      return newRecord;
    } catch (error) {
      console.error('Error in createRecordMoney:', error);
      throw error;
    }
  }

  /**
   * อัปเดตรายการเงิน
   * @param id ID ของรายการเงิน
   * @param data ข้อมูลรายการเงิน
   * @returns รายการเงินที่อัปเดต
   */
  async updateRecordMoney(id: string, data: any) {
    try {
      // แยกข้อมูลสำหรับแต่ละตาราง
      const { customerDeposit, exchange, ...recordData } = data;

      // ดึงข้อมูลรายการเงินเดิม
      const existingRecord = await prisma.finance_transaction.findUnique({
        where: { id },
        include: {
          customerDeposit: true,
          exchange: true
        }
      });

      if (!existingRecord) {
        throw new Error('ไม่พบรายการเงินที่ต้องการอัปเดต');
      }

      // อัปเดตรายการเงินในฐานข้อมูล
      const updatedRecord = await prisma.finance_transaction.update({
        where: { id },
        data: {
          date: new Date(recordData.date),
          salespersonId: recordData.salesperson,
          documentNumber: recordData.documentNumber,
          customerId: recordData.customerId,
          type: recordData.type,
          deposit_purpose: recordData.deposit_purpose,
          // ถ้ามีการอัพโหลดไฟล์ใหม่ ใช้ URL ใหม่ ถ้าไม่มีใช้ URL เดิม
          ...(recordData.transferSlipUrl ? { transferSlipUrl: recordData.transferSlipUrl } : {}),
          updatedAt: new Date(),
          // อัปเดต customerDeposit ถ้ามี
          ...(customerDeposit && {
            customerDeposit: {
              upsert: {
                create: {
                  amountRMB: parseFloat(customerDeposit.amountRMB.toString()),
                  priceDifference: parseFloat(customerDeposit.priceDifference.toString()),
                  exchangeRate: parseFloat(customerDeposit.exchangeRate.toString()),
                  fee: parseFloat(customerDeposit.fee.toString()),
                  amount: parseFloat(customerDeposit.amount.toString()),
                  vat: parseFloat(customerDeposit.vat.toString()),
                  totalWithVat: parseFloat(customerDeposit.totalWithVat.toString()),
                  transferDate: new Date(customerDeposit.transferDate),
                  receivingAccount: customerDeposit.receivingAccount,
                  exchangeRateProfit: parseFloat(customerDeposit.exchangeRateProfit.toString()),
                  incomePerTransaction: parseFloat(customerDeposit.incomePerTransaction.toString()),
                  totalDepositAmount: parseFloat(customerDeposit.totalDepositAmount.toString()),
                  includeVat: customerDeposit.includeVat || false,
                  notes: customerDeposit.notes || '',
                  formattedAmount: customerDeposit.formattedAmount || '',
                  formattedExchangeRateProfit: customerDeposit.formattedExchangeRateProfit || '',
                  formattedIncomePerTransaction: customerDeposit.formattedIncomePerTransaction || '',
                  createdAt: new Date(),
                  updatedAt: new Date()
                },
                update: {
                  amountRMB: parseFloat(customerDeposit.amountRMB.toString()),
                  priceDifference: parseFloat(customerDeposit.priceDifference.toString()),
                  exchangeRate: parseFloat(customerDeposit.exchangeRate.toString()),
                  fee: parseFloat(customerDeposit.fee.toString()),
                  amount: parseFloat(customerDeposit.amount.toString()),
                  vat: parseFloat(customerDeposit.vat.toString()),
                  totalWithVat: parseFloat(customerDeposit.totalWithVat.toString()),
                  transferDate: new Date(customerDeposit.transferDate),
                  receivingAccount: customerDeposit.receivingAccount,
                  exchangeRateProfit: parseFloat(customerDeposit.exchangeRateProfit.toString()),
                  incomePerTransaction: parseFloat(customerDeposit.incomePerTransaction.toString()),
                  totalDepositAmount: parseFloat(customerDeposit.totalDepositAmount.toString()),
                  includeVat: customerDeposit.includeVat || false,
                  notes: customerDeposit.notes || '',
                  formattedAmount: customerDeposit.formattedAmount || '',
                  formattedExchangeRateProfit: customerDeposit.formattedExchangeRateProfit || '',
                  formattedIncomePerTransaction: customerDeposit.formattedIncomePerTransaction || '',
                  updatedAt: new Date()
                }
              }
            }
          }),
          // อัปเดต exchange ถ้ามี
          ...(exchange && {
            exchange: {
              upsert: {
                create: {
                  amountRMB: parseFloat(exchange.amountRMB.toString()),
                  priceDifference: parseFloat(exchange.priceDifference.toString()),
                  exchangeRate: parseFloat(exchange.exchangeRate.toString()),
                  fee: parseFloat(exchange.fee.toString()),
                  amount: parseFloat(exchange.amount.toString()),
                  transferDate: new Date(exchange.transferDate),
                  receivingAccount: exchange.receivingAccount,
                  exchangeRateProfit: parseFloat(exchange.exchangeRateProfit.toString()),
                  incomePerTransaction: parseFloat(exchange.incomePerTransaction.toString()),
                  includeVat: exchange.includeVat || false,
                  vatAmount: parseFloat(exchange.vatAmount.toString()),
                  totalWithVat: parseFloat(exchange.totalWithVat.toString()),
                  notes: exchange.notes || '',
                  formattedAmount: exchange.formattedAmount || '',
                  formattedExchangeRateProfit: exchange.formattedExchangeRateProfit || '',
                  formattedIncomePerTransaction: exchange.formattedIncomePerTransaction || '',
                  createdAt: new Date(),
                  updatedAt: new Date()
                },
                update: {
                  amountRMB: parseFloat(exchange.amountRMB.toString()),
                  priceDifference: parseFloat(exchange.priceDifference.toString()),
                  exchangeRate: parseFloat(exchange.exchangeRate.toString()),
                  fee: parseFloat(exchange.fee.toString()),
                  amount: parseFloat(exchange.amount.toString()),
                  transferDate: new Date(exchange.transferDate),
                  receivingAccount: exchange.receivingAccount,
                  exchangeRateProfit: parseFloat(exchange.exchangeRateProfit.toString()),
                  incomePerTransaction: parseFloat(exchange.incomePerTransaction.toString()),
                  includeVat: exchange.includeVat || false,
                  vatAmount: parseFloat(exchange.vatAmount.toString()),
                  totalWithVat: parseFloat(exchange.totalWithVat.toString()),
                  notes: exchange.notes || '',
                  formattedAmount: exchange.formattedAmount || '',
                  formattedExchangeRateProfit: exchange.formattedExchangeRateProfit || '',
                  formattedIncomePerTransaction: exchange.formattedIncomePerTransaction || '',
                  updatedAt: new Date()
                }
              }
            }
          })
        },
        include: {
          customerDeposit: true,
          exchange: true,
          user: true
        }
      });

      return updatedRecord;
    } catch (error) {
      console.error('Error in updateRecordMoney:', error);
      throw error;
    }
  }

  /**
   * ลบรายการเงิน
   * @param id ID ของรายการเงิน
   * @returns สถานะการลบ
   */
  async deleteRecordMoney(id: string) {
    try {
      // ใช้ soft delete โดยการกำหนด deletedAt
      await prisma.finance_transaction.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Error in deleteRecordMoney:', error);
      throw error;
    }
  }
}
