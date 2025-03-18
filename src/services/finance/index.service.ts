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

  constructor() {
    this.financeRepo = new FinanceRepository();
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

  public async getWorkByid(id: string) {
    try {
      const finance_work = await this.financeRepo.getWorkByid(id)
      
      // ตรวจสอบว่ามีข้อมูล amount_payment_do และ price_deposit หรือไม่
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


  public async submitPurchase(Request:Partial<any>) {
    try {
      const data = Request;
      
      // Convert work_id to d_purchase_id if needed
      data.d_purchase_id = data.work_id;

      // Main purchase finance data
      const purchaseFinanceData: FinanceInterface = {
        d_purchase_id: data.d_purchase_id,
        finance_status: data.finance_status,
        
        // ข้อมูลตู้
        container_number: data.container_number === null ? null : data.container_number?.toString(),
        container_size: data.container_size === null ? null : data.container_size?.toString(),
        seal_number: data.seal_number === null ? null : data.seal_number?.toString(),
        
        // ข้อมูลเรือ
        ship_name: data.ship_name === null ? null : data.ship_name?.toString(),
        
        // ข้อมูลท่าเรือ
        port_load: data.port_load === null ? null : data.port_load?.toString(),
        port_discharge: data.port_discharge === null ? null : data.port_discharge?.toString(),
        
        // ข้อมูลวันที่
        etd_date: data.etd_date === null ? null : data.etd_date?.toString(),
        eta_date: data.eta_date === null ? null : data.eta_date?.toString(),
        
        // ข้อมูลการเงิน
        billing_code: data.billing_code === null ? null : data.billing_code?.toString(),
        billing_amount: data.billing_amount === null ? null : data.billing_amount?.toString(),
        total_before_vat: data.total_before_vat === null ? null : data.total_before_vat?.toString(),
        vat_amount: data.vat_amount === null ? null : data.vat_amount?.toString(),
        total_after_vat: data.total_after_vat === null ? null : data.total_after_vat?.toString(),
        
        // ข้อมูลการคำนวณ
        total_payment_all: data.total_payment_all === null ? null : data.total_payment_all?.toString(),
        miss_payment: data.miss_payment === null ? null : data.miss_payment?.toString(),
        profit_loss: data.profit_loss === null ? null : data.profit_loss?.toString(),
        price_service: data.price_service === null ? null : data.price_service?.toString(),
        total_profit_loss: data.total_profit_loss === null ? null : data.total_profit_loss?.toString(),
        text_profit_loss: data.text_profit_loss === null ? null : data.text_profit_loss?.toString(),
      };

      // Payment details data
      const paymentData: PaymentDetailsInterface = {
        payment_date_1: data.payment_date_1 === null ? null : data.payment_date_1?.toString(),
        payment_date_2: data.payment_date_2 === null ? null : data.payment_date_2?.toString(),
        payment_date_3: data.payment_date_3 === null ? null : data.payment_date_3?.toString(),
        payment_amount_1: data.payment_amount_1 === null ? null : data.payment_amount_1?.toString(),
        payment_amount_2: data.payment_amount_2 === null ? null : data.payment_amount_2?.toString(),
        payment_amount_3: data.payment_amount_3 === null ? null : data.payment_amount_3?.toString(),
        remaining_amount_1: data.remaining_amount_1 === null ? null : data.remaining_amount_1?.toString(),
        remaining_amount_2: data.remaining_amount_2 === null ? null : data.remaining_amount_2?.toString(),
        remaining_amount_3: data.remaining_amount_3 === null ? null : data.remaining_amount_3?.toString(),
        payment_status: data.payment_status === null ? null : data.payment_status?.toString(),
      };
      
      // Tax return data
      const taxReturnData: TaxReturnInterface = {
        // ข้อมูลคืนภาษีจากตู้
        tax_return_checked: data.tax_return_checked === null ? null : data.tax_return_checked,
        tax_return_amount: data.tax_return_amount === null ? null : data.tax_return_amount?.toString(),
        tax_return_date: data.tax_return_date === null ? null : data.tax_return_date?.toString(),
        
        // ข้อมูลกำไรและค่าบริหารจัดการ
        management_fee: data.management_fee === null ? null : data.management_fee?.toString(),
        percentage_fee: data.percentage_fee === null ? null : data.percentage_fee?.toString(),
        net_profit: data.net_profit === null ? null : data.net_profit?.toString(),
        profit_loss: data.profit_loss === null ? null : data.profit_loss?.toString(),
      };

      // China expenses data
      const chinaExpensesData: ChinaExpensesInterface = {
        ch_freight: data.ch_freight === null ? null : data.ch_freight?.toString(),
        ch_exchange_rate: data.ch_exchange_rate === null ? null : data.ch_exchange_rate?.toString(),
        ch_freight_total: data.ch_freight_total === null ? null : data.ch_freight_total?.toString()
      };

      // Thailand expenses data
      const thailandExpensesData: ThailandExpensesInterface = {
        th_duty: data.th_duty === null ? null : data.th_duty?.toString(),
        th_tax: data.th_tax === null ? null : data.th_tax?.toString(),
        th_employee: data.th_employee === null ? null : data.th_employee?.toString(),
        th_warehouse: data.th_warehouse === null ? null : data.th_warehouse?.toString(),
        th_custom_fees: data.th_custom_fees === null ? null : data.th_custom_fees?.toString(),
        th_overtime: data.th_overtime === null ? null : data.th_overtime?.toString(),
        th_check_fee: data.th_check_fee === null ? null : data.th_check_fee?.toString(),
        th_product_account: data.th_product_account === null ? null : data.th_product_account?.toString(),
        th_license_fee: data.th_license_fee === null ? null : data.th_license_fee?.toString(),
        th_gasoline: data.th_gasoline === null ? null : data.th_gasoline?.toString(),
        th_hairy: data.th_hairy === null ? null : data.th_hairy?.toString(),
        th_other_fee: data.th_other_fee === null ? null : data.th_other_fee?.toString(),
      };
      
      // Port expenses data
      const portExpensesData: PortExpensesInterface = {
        th_port_name: data.th_port_name === null ? null : data.th_port_name?.toString(),
        th_port_fee: data.th_port_fee === null ? null : data.th_port_fee?.toString(),
        th_lift_on_off: data.th_lift_on_off === null ? null : data.th_lift_on_off?.toString(),
        th_ground_fee: data.th_ground_fee === null ? null : data.th_ground_fee?.toString(),
        th_port_other_fee: data.th_port_other_fee === null ? null : data.th_port_other_fee?.toString(),
        th_price_head_tractor: data.th_price_head_tractor === null ? null : data.th_price_head_tractor?.toString(),
        th_total_port_fee: data.th_total_port_fee === null ? null : data.th_total_port_fee?.toString()
      };
      
      // DO expenses data
      const doExpensesData: DOExpensesInterface = {
        amount_payment_do: data.amount_payment_do === null ? null : data.amount_payment_do?.toString(),
        price_deposit: data.price_deposit === null ? null : data.price_deposit?.toString(),
      };

      // Shipping data - Note: th_shipping_price is mapped from th_shipping in the form
      const shippingData: ShippingDetailsInterface = {
        th_shipping_price: data.th_shipping === null ? null : data.th_shipping?.toString(), // Map from th_shipping
        th_shipping_note: data.th_shipping_note === null ? null : data.th_shipping_note?.toString(),
        th_shipping_advance: data.th_shipping_advance === null ? null : data.th_shipping_advance?.toString(),
        th_shipping_remaining: data.th_shipping_remaining === null ? null : data.th_shipping_remaining?.toString(),
        th_shipping_return_to: data.th_shipping_return_to === null ? null : data.th_shipping_return_to?.toString(),
        th_total_shipping: data.th_total_shipping === null ? null : data.th_total_shipping?.toString(),
      };

      if(data.id) {
        purchaseFinanceData.id = data.id.toString();
      }

      // Pass the structured data to the repository
      const purchase = await this.financeRepo.submitPurchase({
        purchaseFinanceData,
        paymentData,
        taxReturnData,
        chinaExpensesData,
        thailandExpensesData,
        portExpensesData,
        doExpensesData,
        shippingData
      } as PurchaseFinanceDataInterface);

      if(purchase == null){
        return null;
      }
      
      return purchase;
    } catch (err: any) {
      console.log("errsubmitPurchase", err);
      throw err;
    }
  }

  public async updatePurchase(id:string, Request:any):Promise<any> {
    try {
      // Convert work_id to d_purchase_id if needed
      if(Request.work_id && !Request.d_purchase_id) {
        Request.d_purchase_id = Request.work_id;
      }

      // Main purchase finance data
      const purchaseFinanceData: FinanceInterface = {
        d_purchase_id: Request.d_purchase_id,
        finance_status: Request.finance_status,
        
        // ข้อมูลตู้
        container_number: Request.container_number === null ? null : Request.container_number?.toString(),
        container_size: Request.container_size === null ? null : Request.container_size?.toString(),
        seal_number: Request.seal_number === null ? null : Request.seal_number?.toString(),
        
        // ข้อมูลเรือ
        ship_name: Request.ship_name === null ? null : Request.ship_name?.toString(),
        
        // ข้อมูลท่าเรือ
        port_load: Request.port_load === null ? null : Request.port_load?.toString(),
        port_discharge: Request.port_discharge === null ? null : Request.port_discharge?.toString(),
        
        // ข้อมูลวันที่
        etd_date: Request.etd_date === null ? null : Request.etd_date?.toString(),
        eta_date: Request.eta_date === null ? null : Request.eta_date?.toString(),
        
        // ข้อมูลการเงิน
        billing_code: Request.billing_code === null ? null : Request.billing_code?.toString(),
        billing_amount: Request.billing_amount === null ? null : Request.billing_amount?.toString(),
        total_before_vat: Request.total_before_vat === null ? null : Request.total_before_vat?.toString(),
        vat_amount: Request.vat_amount === null ? null : Request.vat_amount?.toString(),
        total_after_vat: Request.total_after_vat === null ? null : Request.total_after_vat?.toString(),
        
        // ข้อมูลการคำนวณ
        total_payment_all: Request.total_payment_all === null ? null : Request.total_payment_all?.toString(),
        miss_payment: Request.miss_payment === null ? null : Request.miss_payment?.toString(),
        profit_loss: Request.profit_loss === null ? null : Request.profit_loss?.toString(),
        price_service: Request.price_service === null ? null : Request.price_service?.toString(),
        total_profit_loss: Request.total_profit_loss === null ? null : Request.total_profit_loss?.toString(),
        text_profit_loss: Request.text_profit_loss === null ? null : Request.text_profit_loss?.toString(),
      };

      // Payment details data
      const paymentData: PaymentDetailsInterface = {
        payment_date_1: Request.payment_date_1 === null ? null : Request.payment_date_1?.toString(),
        payment_date_2: Request.payment_date_2 === null ? null : Request.payment_date_2?.toString(),
        payment_date_3: Request.payment_date_3 === null ? null : Request.payment_date_3?.toString(),
        payment_amount_1: Request.payment_amount_1 === null ? null : Request.payment_amount_1?.toString(),
        payment_amount_2: Request.payment_amount_2 === null ? null : Request.payment_amount_2?.toString(),
        payment_amount_3: Request.payment_amount_3 === null ? null : Request.payment_amount_3?.toString(),
        remaining_amount_1: Request.remaining_amount_1 === null ? null : Request.remaining_amount_1?.toString(),
        remaining_amount_2: Request.remaining_amount_2 === null ? null : Request.remaining_amount_2?.toString(),
        remaining_amount_3: Request.remaining_amount_3 === null ? null : Request.remaining_amount_3?.toString(),
        payment_status: Request.payment_status === null ? null : Request.payment_status?.toString(),
      };
      
      // Tax return data
      const taxReturnData: TaxReturnInterface = {
        // ข้อมูลคืนภาษีจากตู้
        tax_return_checked: Request.tax_return_checked === null ? null : Request.tax_return_checked,
        tax_return_amount: Request.tax_return_amount === null ? null : Request.tax_return_amount?.toString(),
        tax_return_date: Request.tax_return_date === null ? null : Request.tax_return_date?.toString(),
        
        // ข้อมูลกำไรและค่าบริหารจัดการ
        management_fee: Request.management_fee === null ? null : Request.management_fee?.toString(),
        percentage_fee: Request.percentage_fee === null ? null : Request.percentage_fee?.toString(),
        net_profit: Request.net_profit === null ? null : Request.net_profit?.toString(),
        profit_loss: Request.profit_loss === null ? null : Request.profit_loss?.toString(),
      };

      // China expenses data
      const chinaExpensesData: ChinaExpensesInterface = {
        ch_freight: Request.ch_freight === null ? null : Request.ch_freight?.toString(),
        ch_exchange_rate: Request.ch_exchange_rate === null ? null : Request.ch_exchange_rate?.toString(),
        ch_freight_total: Request.ch_freight_total === null ? null : Request.ch_freight_total?.toString()
      };

      // Thailand expenses data
      const thailandExpensesData: ThailandExpensesInterface = {
        th_duty: Request.th_duty === null ? null : Request.th_duty?.toString(),
        th_tax: Request.th_tax === null ? null : Request.th_tax?.toString(),
        th_employee: Request.th_employee === null ? null : Request.th_employee?.toString(),
        th_warehouse: Request.th_warehouse === null ? null : Request.th_warehouse?.toString(),
        th_custom_fees: Request.th_custom_fees === null ? null : Request.th_custom_fees?.toString(),
        th_overtime: Request.th_overtime === null ? null : Request.th_overtime?.toString(),
        th_check_fee: Request.th_check_fee === null ? null : Request.th_check_fee?.toString(),
        th_product_account: Request.th_product_account === null ? null : Request.th_product_account?.toString(),
        th_license_fee: Request.th_license_fee === null ? null : Request.th_license_fee?.toString(),
        th_gasoline: Request.th_gasoline === null ? null : Request.th_gasoline?.toString(),
        th_hairy: Request.th_hairy === null ? null : Request.th_hairy?.toString(),
        th_other_fee: Request.th_other_fee === null ? null : Request.th_other_fee?.toString(),
      };
      
      // Port expenses data
      const portExpensesData: PortExpensesInterface = {
        th_port_name: Request.th_port_name === null ? null : Request.th_port_name?.toString(),
        th_port_fee: Request.th_port_fee === null ? null : Request.th_port_fee?.toString(),
        th_lift_on_off: Request.th_lift_on_off === null ? null : Request.th_lift_on_off?.toString(),
        th_ground_fee: Request.th_ground_fee === null ? null : Request.th_ground_fee?.toString(),
        th_port_other_fee: Request.th_port_other_fee === null ? null : Request.th_port_other_fee?.toString(),
        th_price_head_tractor: Request.th_price_head_tractor === null ? null : Request.th_price_head_tractor?.toString(),
        th_total_port_fee: Request.th_total_port_fee === null ? null : Request.th_total_port_fee?.toString()
      };
      
      // DO expenses data
      const doExpensesData: DOExpensesInterface = {
        amount_payment_do: Request.amount_payment_do === null ? null : Request.amount_payment_do?.toString(),
        price_deposit: Request.price_deposit === null ? null : Request.price_deposit?.toString(),
      };

      // Shipping data - Note: th_shipping_price is mapped from th_shipping in the form
      const shippingData: ShippingDetailsInterface = {
        th_shipping_price: Request.th_shipping === null ? null : Request.th_shipping?.toString(), // Map from th_shipping
        th_shipping_note: Request.th_shipping_note === null ? null : Request.th_shipping_note?.toString(),
        th_shipping_advance: Request.th_shipping_advance === null ? null : Request.th_shipping_advance?.toString(),
        th_shipping_remaining: Request.th_shipping_remaining === null ? null : Request.th_shipping_remaining?.toString(),
        th_shipping_return_to: Request.th_shipping_return_to === null ? null : Request.th_shipping_return_to?.toString(),
        th_total_shipping: Request.th_total_shipping === null ? null : Request.th_total_shipping?.toString(),
      };

      const purchase = await this.financeRepo.updatePurchase(id, {
        purchaseFinanceData,
        paymentData,
        taxReturnData,
        chinaExpensesData,
        thailandExpensesData,
        portExpensesData,
        doExpensesData,
        shippingData
      } as PurchaseFinanceDataInterface);
      
      return purchase;
    } catch (err: any) {
      console.log("errupdatePurchase", err);
      throw err;
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
