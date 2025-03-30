import { Request, Response } from "express";

//repositroy
import FinanceRepository from "../../repository/finance/index.repository";

//interface
import { FinanceInterface, PaymentDetailsInterface, TaxReturnInterface, ChinaExpensesInterface, ThailandExpensesInterface, PortExpensesInterface, DOExpensesInterface, ShippingDetailsInterface } from "./dto/finance.interface";
import { PurchaseFinanceDataInterface } from "./dto/purchaseFinanceData.interface";

//import { PrismaClient, withdrawalInformaion } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { withdrawalInformaion } from "@prisma/client";

class FinanceService {

    private financeRepo: FinanceRepository;
    private prisma: PrismaClient;

  constructor() {
    this.financeRepo = new FinanceRepository();
    this.prisma = new PrismaClient();
  }

  public async getPurchasebySearch(search:string):Promise<any>{
    try{
      const purchase :any = await this.financeRepo.getPurchaseBysearch(search);

      return purchase;
    }
    catch(err:any){
      console.log("errgetPurchase", err)
      throw err
    }
  }

  public async getPurchase(Request:Partial<any>) {

    try{
      const purchase :any = await this.financeRepo.getPurchase(Request);

      const data = [];
      

      for (let datas of purchase.purchase) {
        if (datas.d_status === 'Sale ตีราคา') {
          datas.color = 'bg-blue-500'
        }
        if (datas.d_status === 'Cs รับงาน') {
          datas.color = 'bg-[#FFC8C8]'
        }
        if (datas.d_status === 'CS ร้องขอเอกสาร') {
          datas.color = 'bg-red-400'
        }
        if (datas.d_status === 'Sale แนบเอกสาร') {
          datas.color = 'bg-red-400'
        }
        if (datas.d_status === 'Cs เสนอราคา') {
          datas.color = 'bg-orange-300'
        }
        if (datas.d_status === 'ยกเลิกคำสั่งซื้อ') {
          datas.color = 'bg-red-500'
        }
        if (datas.d_status === 'อยู่ระหว่างทำ Financial') {
          datas.color = 'bg-[#946A00]'
        }
        if (datas.d_status === 'ค้างชำระเงิน') {
          datas.color = 'bg-red-500'
        }
        if (datas.d_status === 'ปิดการขาย') {
          datas.color = 'bg-green-500'
        }
        if (datas.d_status === 'ลูกค้าเครดิต') {
          datas.color = 'bg-blue-500'
        }
        data.push(datas)
      }
      return { purchase: data, total: purchase.total }
    }
    catch(err:any){
      console.log("errgetPurchase", err)
      throw err
    }
  }

  public async getPurchaseById(id: string) {
    try {
      const purchase = await this.financeRepo.getPurchaseById(id)

      return purchase
    } catch (err: any) {
      console.log("errgetPurchaseById", err)
      throw err
    }
  }

  public async getWidhdrawalInformationByShipmentNumber(id: string) {
    try {

      const purchase   = await this.financeRepo.getPurchaseById(id)

      const withdrawal = await this.financeRepo.getWidhdrawalInformationByShipmentNumber(purchase.d_shipment_number)
      return withdrawal;
    } catch (err: any) {
      console.log("errgetWidhdrawalInformationByShipmentNumber", err)
      throw err
    }
  }

  public async getWorkByid(id: string) {
    try {
      let finance_work = await this.financeRepo.getWorkByid(id)


      console.log("Thailand expenses data:", finance_work?.thailand_expenses);
      console.log("Amount payment DO:", finance_work?.amount_payment_do);
      console.log("Price deposit:", finance_work?.price_deposit);
      
      return finance_work 
    }
    catch(err:any){
      console.log("errgetWorkByid", err)
      throw err
    }
  }


  public async submitPurchase(data: any) {
    try {
        // แยกข้อมูล payment_details ออกมา
        const { payment_details, ...allData } = data;
        
        // Convert work_id to d_purchase_id if needed
        if(allData.work_id && !allData.d_purchase_id) {
            allData.d_purchase_id = allData.work_id;
        }
        
        // ใช้ transaction เพื่อให้มั่นใจว่าถ้ามีข้อผิดพลาดจะ rollback ทั้งหมด
        return await this.prisma.$transaction(async (prismaClient) => {
            // แยกข้อมูลตามโครงสร้างของตาราง purchase_finance

            
            const purchaseFinanceData = {
                d_purchase_id: allData.d_purchase_id,
                
                // ข้อมูลตู้
                container_number: allData.container_number || null,
                container_size: allData.container_size || null,
                seal_number: allData.seal_number || null,
                payment_status: allData.payment_status || null,
                
                // ข้อมูลเรือ
                ship_name: allData.ship_name || null,
                
                // ข้อมูลท่าเรือ
                port_load: allData.port_load || null,
                port_discharge: allData.port_discharge || null,
                
                // ข้อมูลวันที่
                etd_date: allData.etd_date || null,
                eta_date: allData.eta_date || null,
                
                // ข้อมูลการเงิน
                billing_code: allData.billing_code || null,
                billing_amount: allData.billing_amount || null,
                total_before_vat: allData.total_before_vat || null,
                vat_amount: allData.vat_amount || null,
                total_after_vat: allData.total_after_vat || null,
            };
            
            // สร้างข้อมูลหลักของการชำระเงิน
            const purchaseFinance = await prismaClient.purchase_finance.create({
                data: purchaseFinanceData
            });
            
            // ข้อมูลค่าใช้จ่ายจีน
            const chinaExpensesData = {
                purchase_finance_id: purchaseFinance.id,
                ch_freight: allData.ch_freight || null,
                ch_exchange_rate: allData.ch_exchange_rate || null,
                ch_freight_total: allData.ch_freight_total || null
            };
            
            // บันทึกข้อมูลค่าใช้จ่ายจีน
            await prismaClient.purchase_finance_china_expenses.create({
                data: chinaExpensesData
            });
            
            // ข้อมูลค่าใช้จ่ายไทย
            const thailandExpensesData = {
                purchase_finance_id: purchaseFinance.id,
                
                // ค่าใช้จ่ายทั่วไป
                th_shipping_note :allData.th_shipping_note || null,
                
                th_duty: allData.th_duty || null,
                th_tax: allData.th_tax || null,
                th_employee: allData.th_employee || null,
                th_warehouse: allData.th_warehouse || null,
                th_custom_fees: allData.th_custom_fees || null,
                th_overtime: allData.th_overtime || null,
                th_check_fee: allData.th_check_fee || null,
                th_product_account: allData.th_product_account || null,
                th_license_fee: allData.th_license_fee || null,
                th_gasoline: allData.th_gasoline || null,
                th_hairy: allData.th_hairy || null,
                th_other_fee: allData.th_other_fee || null,
                
                // ข้อมูลค่าใช้จ่ายหัวลาก
                th_port_name: allData.th_port_name || null,
                th_port_fee: allData.th_port_fee || null,
                th_lift_on_off: allData.th_lift_on_off || null,
                th_port_note : allData.th_port_note  || null,
                th_ground_fee: allData.th_ground_fee || null,
                th_port_other_fee: allData.th_port_other_fee || null,
                th_price_head_tractor: allData.th_price_head_tractor || null,
                th_total_port_fee: allData.th_total_port_fee || null,
                
                // ข้อมูลค่าใช้จ่าย D/O
                amount_payment_do: allData.amount_payment_do || null,
                price_deposit: allData.price_deposit || null
            };
            
            // บันทึกข้อมูลค่าใช้จ่ายไทย
            await prismaClient.purchase_finance_thailand_expenses.create({
                data: thailandExpensesData
            });
            
            // ข้อมูล Shipping
            const shippingData = {
                purchase_finance_id: purchaseFinance.id,
                th_shipping_price: allData.th_shipping_price || null,
                th_shipping_advance: allData.th_shipping_advance || null,
                th_shipping_remaining: allData.th_shipping_remaining || null,
                th_shipping_return_to: allData.th_shipping_return_to || null,
                th_total_shipping: allData.th_total_shipping || null
            };
            
            // บันทึกข้อมูล Shipping
            await prismaClient.purchase_finance_shipping.create({
                data: shippingData
            });
            
            // ข้อมูลการชำระเงินและภาษี
            const paymentData = {
                purchase_finance_id: purchaseFinance.id,
                
                // สถานะการชำระเงิน
                payment_status: allData.payment_status || null,
                
                // ข้อมูลคืนภาษีจากตู้
                tax_return_checked: allData.tax_return_checked || false,
                tax_return_amount: allData.tax_return_amount || null,
                tax_return_date: allData.tax_return_date || null,
                
                // ข้อมูลกำไรและค่าบริหารจัดการ
                management_fee: allData.management_fee || null,
                percentage_fee: allData.percentage_fee || null,
                net_profit: allData.net_profit || null,
                profit_loss: allData.profit_loss || null
            };
            
            // บันทึกข้อมูลการชำระเงินและภาษี
            await prismaClient.purchase_finance_payment.create({
                data: paymentData
            });
            
            // บันทึกข้อมูลการชำระเงินแต่ละรายการ
            if (payment_details && payment_details.length > 0) {
                for (const detail of payment_details) {
                    await prismaClient.finance_payment_detail.create({
                        data: {
                            purchase_finance_id: purchaseFinance.id,
                            payment_date: detail.payment_date,
                            payment_amount: detail.payment_amount.toString(),
                            remaining_amount: detail.remaining_amount.toString()
                        }
                    });
                }
            }
            
            return purchaseFinance;
        });
    } catch (error) {
        console.error('Error in submitPurchase:', error);
        throw error;
    }
}

  public async updatePurchase(id: string, data: any) {
    try {
        // แยกข้อมูล payment_details ออกมา
        const { payment_details, ...allData } = data;

        console.log("percentage_fee", allData.percentage_fee)
        
        // Convert work_id to d_purchase_id if needed
        if(allData.work_id && !allData.d_purchase_id) {
            allData.d_purchase_id = allData.work_id;
        }
        
        // ใช้ transaction เพื่อให้มั่นใจว่าถ้ามีข้อผิดพลาดจะ rollback ทั้งหมด
        return await this.prisma.$transaction(async (prismaClient) => {
            try {
                // แยกข้อมูลตามโครงสร้างของตาราง purchase_finance
                const purchaseFinanceData = {
                    d_purchase_id: allData.d_purchase_id,
                    
                    // ข้อมูลตู้
                    container_number: allData.container_number || null,
                    container_size: allData.container_size || null,
                    seal_number: allData.seal_number || null,
                    
                    // ข้อมูลเรือ
                    ship_name: allData.ship_name || null,
                    payment_status: allData.payment_status || null,
                    // ข้อมูลท่าเรือ
                    port_load: allData.port_load || null,
                    port_discharge: allData.port_discharge || null,
                    
                    // ข้อมูลวันที่
                    etd_date: allData.etd_date || null,
                    eta_date: allData.eta_date || null,
                    
                    // ข้อมูลการเงิน
                    billing_code: allData.billing_code || null,
                    billing_amount: allData.billing_amount || null,
                    total_before_vat: allData.total_before_vat || null,
                    vat_amount: allData.vat_amount || null,
                    total_after_vat: allData.total_after_vat || null,
                };
                
                // อัพเดทข้อมูลหลักของการชำระเงิน
                const purchaseFinance = await prismaClient.purchase_finance.update({
                    where: { id },
                    data: purchaseFinanceData
                });
                
                // ข้อมูลค่าใช้จ่ายจีน
                const chinaExpensesData = {
                    purchase_finance_id: id,
                    ch_freight: allData.ch_freight || null,
                    ch_exchange_rate: allData.ch_exchange_rate || null,
                    ch_freight_total: allData.ch_freight_total || null
                };
                
                // อัพเดทหรือสร้างข้อมูลค่าใช้จ่ายจีน
                await prismaClient.purchase_finance_china_expenses.upsert({
                    where: { purchase_finance_id: id },
                    update: chinaExpensesData,
                    create: chinaExpensesData
                });
                
                // ข้อมูลค่าใช้จ่ายไทย
                const thailandExpensesData = {
                    purchase_finance_id: id,
                    
                    // ค่าใช้จ่ายทั่วไป
                    th_duty: allData.th_duty || null,
                    th_shipping_note :allData.th_shipping_note || null,
                    th_tax: allData.th_tax || null,
                    th_employee: allData.th_employee || null,
                    th_warehouse: allData.th_warehouse || null,
                    th_custom_fees: allData.th_custom_fees || null,
                    th_overtime: allData.th_overtime || null,
                    th_check_fee: allData.th_check_fee || null,
                    th_product_account: allData.th_product_account || null,
                    th_license_fee: allData.th_license_fee || null,
                    th_gasoline: allData.th_gasoline || null,
                    th_hairy: allData.th_hairy || null,
                    th_other_fee: allData.th_other_fee || null,
                    
                    // ข้อมูลค่าใช้จ่ายหัวลาก
                    th_port_name: allData.th_port_name || null,
                    th_port_fee: allData.th_port_fee || null,
                    th_port_note : allData.th_port_note  || null,
                    th_lift_on_off: allData.th_lift_on_off || null,
                    th_ground_fee: allData.th_ground_fee || null,
                    th_port_other_fee: allData.th_port_other_fee || null,
                    th_price_head_tractor: allData.th_price_head_tractor || null,
                    th_total_port_fee: allData.th_total_port_fee || null,
                    
                    // ข้อมูลค่าใช้จ่าย D/O
                    amount_payment_do: allData.amount_payment_do || null,
                    price_deposit: allData.price_deposit || null
                };
                
                // อัพเดทหรือสร้างข้อมูลค่าใช้จ่ายไทย
                await prismaClient.purchase_finance_thailand_expenses.upsert({
                    where: { purchase_finance_id: id },
                    update: thailandExpensesData,
                    create: thailandExpensesData
                });
                
                // ข้อมูล Shipping
                const shippingData = {
                    purchase_finance_id: id,
                    th_shipping_price: allData.th_shipping_price || null,
                    th_shipping_advance: allData.th_shipping_advance || null,
                    th_shipping_remaining: allData.th_shipping_remaining || null,
                    th_shipping_return_to: allData.th_shipping_return_to || null,
                    th_total_shipping: allData.th_total_shipping || null
                };
                
                // อัพเดทหรือสร้างข้อมูล Shipping
                await prismaClient.purchase_finance_shipping.upsert({
                    where: { purchase_finance_id: id },
                    update: shippingData,
                    create: shippingData
                });
                
                // ข้อมูลการชำระเงินและภาษี
                const paymentData = {
                    purchase_finance_id: id,
                    
                    // สถานะการชำระเงิน
                    payment_status: allData.payment_status || null,
                    
                    // ข้อมูลคืนภาษีจากตู้
                    tax_return_checked: allData.tax_return_checked || false,
                    tax_return_amount: allData.tax_return_amount || null,
                    tax_return_date: allData.tax_return_date || null,
                    
                    // ข้อมูลกำไรและค่าบริหารจัดการ
                    management_fee: allData.management_fee || null,
                    percentage_fee: allData.percentage_fee || null,
                    net_profit: allData.net_profit || null,
                    profit_loss: allData.profit_loss || null
                };
                
                // อัพเดทหรือสร้างข้อมูลการชำระเงินและภาษี
                await prismaClient.purchase_finance_payment.upsert({
                    where: { purchase_finance_id: id },
                    update: paymentData,
                    create: paymentData
                });
                
                // ลบข้อมูลการชำระเงินเดิมทั้งหมด
                await prismaClient.finance_payment_detail.deleteMany({
                    where: { purchase_finance_id: id }
                });
                
                // บันทึกข้อมูลการชำระเงินใหม่แต่ละรายการ
                if (payment_details && payment_details.length > 0) {
                    // สร้างข้อมูลการชำระเงินทั้งหมดในคราวเดียว
                    await prismaClient.finance_payment_detail.createMany({
                        data: payment_details.map((detail:any) => ({
                            purchase_finance_id: id,
                            payment_date: detail.payment_date,
                            payment_amount: detail.payment_amount.toString(),
                            remaining_amount: detail.remaining_amount.toString()
                        }))
                    });
                }
                
                console.log('Transaction completed successfully');
                return purchaseFinance;
            } catch (transactionError) {
                console.error('Transaction error in updatePurchase:', transactionError);
                // Transaction will automatically rollback on error
                throw transactionError;
            }
        });
    } catch (error) {
        console.error('Error in updatePurchase:', error);
        throw error;
    }
}

  public async getWidhdrawalInformation(Request:Partial<any>) {
    try {
      const result = await this.financeRepo.getWidhdrawalInformation(Request);
    
      return result;
    } catch (err: any) {
      console.log("errgetWidhdrawalInformation", err)
      throw err
    }
  }

  public async CheckWidhdrawalInformation(Request:Partial<any>) {
    try {
      const widhdrawalInformation = await this.financeRepo.CheckWidhdrawalInformation(Request)
      return widhdrawalInformation
    } catch (err: any) {
      console.log("errCheckWidhdrawalInformation", err)
      throw err
    }
  }


  public async submitWidhdrawalInformation(Request: any) {
    try {
      const widhdrawalInformation = await this.financeRepo.submitWidhdrawalInformation(Request)
      return widhdrawalInformation
    } catch (err: any) {
      console.log("errsubmitWidhdrawalInformation", err)
      throw err
    }
  }

  public async updateWidhdrawalInformation(Request: Partial<any>) {
    try {
      const widhdrawalInformation = await this.financeRepo.updateWidhdrawalInformation(Request)
      return widhdrawalInformation
    } catch (err: any) {
      console.log("errupdateWidhdrawalInformation", err)
      throw err
    }
  }

  public async deleteWithdrawalInformation(id:string) {
    try {
      const widhdrawalInformation = await this.financeRepo.deleteWithdrawalInformation(id)
      return widhdrawalInformation
    } catch (err: any) {
      console.log("errdeleteWithdrawalInformation", err)
      throw err
    }
  }

  public async deleteWithdrawalInformationByGroupId(groupId: string) {
    try {
      const result = await this.financeRepo.deleteWithdrawalInformationByGroupId(groupId);
      return result;
    } catch (err: any) {
      console.log("errDeleteWithdrawalInformationByGroupId", err);
      throw err;
    }
  }

  public async getWidhdrawalInformationByGroupId(groupId: string) {
    try {
      const records = await this.financeRepo.getWidhdrawalInformationByGroupId(groupId);
      return records;
    } catch (err: any) {
      console.log("errgetWidhdrawalInformationByGroupId", err);
      throw err;
    }
  }

  public async createFinancialRecord(data: any): Promise<any> {
    try {
      const record = await this.financeRepo.createFinancialRecord(data);
      return record;
    } catch (err: any) {
      console.log("Error creating financial record", err);
      throw err;
    }
  }

  public async getFinancialRecords(filters: any): Promise<any> {
    try {
      const records = await this.financeRepo.getFinancialRecords(filters);
      return records;
    } catch (err: any) {
      console.log("Error getting financial records", err);
      throw err;
    }
  }

  public async getFinancialRecordById(id: string): Promise<any> {
    try {
      const record = await this.financeRepo.getFinancialRecordById(id);
      return record;
    } catch (err: any) {
      console.log("Error getting financial record by ID", err);
      throw err;
    }
  }

  public async updateFinancialRecord(id: string, data: any): Promise<any> {
    try {
      const record = await this.financeRepo.updateFinancialRecord(id, data);
      return record;
    } catch (err: any) {
      console.log("Error updating financial record", err);
      throw err;
    }
  }

  public async deleteFinancialRecord(id: string): Promise<any> {
    try {
      const record = await this.financeRepo.deleteFinancialRecord(id);
      return record;
    } catch (err: any) {
      console.log("Error deleting financial record", err);
      throw err;
    }
  }


  


}


export default FinanceService;
