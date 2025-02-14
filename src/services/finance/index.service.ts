import { Request, Response } from "express";

//repositroy
import FinanceRepository from "../../repository/finance/index.repository";


import { PrismaClient, withdrawalInformaion } from "@prisma/client";

//interface
import  { FinanceInterface } from "./dto/finance.interface"



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

      const Body : FinanceInterface = {
        d_purchase_id:data.d_purchase_id.toString(),
        ch_freight: data.ch_freight === null ? null : data.ch_freight.toString(),
        ch_rate: data.ch_rate === null ? null : data.ch_rate.toString(),
        ch_freight_total: data.ch_freight_total === null ? null : data.ch_freight_total.toString(),
        miss_payment: data.miss_payment === null ? null : data.miss_payment.toString(),
        total_before_vat: data.total_before_vat === null ? null : data.total_before_vat.toString(),
        total_profit_loss: data.total_profit_loss === null ? null : data.total_profit_loss.toString(),
        text_profit_loss: data.text_profit_loss === null ? null : data.text_profit_loss.toString(),
        finance_status: data.finance_status === null ? null : data.finance_status.toString(),
        total_all_th: data.total_all_th === null ? null : data.total_all_th.toString(),
        th_cn_total: data.th_cn_total === null ? null : data.th_cn_total.toString(),
        th_duty: data.th_duty === null ? null : data.th_duty.toString(),
        th_tax: data.th_tax === null ? null : data.th_tax.toString(),
        th_customs_fees: data.th_customs_fees === null ? null : data.th_customs_fees.toString(),
        th_overtime: data.th_overtime === null ? null : data.th_overtime.toString(),
        th_employee: data.th_employee === null ? null : data.th_employee.toString(),
        billing_amount: data.billing_amount === null ? null : data.billing_amount.toString(),
        th_warehouse: data.th_warehouse === null ? null : data.th_warehouse.toString(),
        th_gasoline: data.th_gasoline === null ? null : data.th_gasoline.toString(),
        th_other_shipping: data.th_other_shipping === null ? null : data.th_other_shipping.toString(),
        th_hairy: data.th_hairy === null ? null : data.th_hairy.toString(),
        th_head_tractor: data.th_head_tractor === null ? null : data.th_head_tractor.toString(),
        th_price_head_tractor: data.th_price_head_tractor === null ? null : data.th_price_head_tractor.toString(),
        th_other_fee: data.th_other_fee === null ? null : data.th_other_fee.toString(),
        th_total_shipping: data.th_total_shipping === null ? null : data.th_total_shipping.toString(),
        price_service: data.price_service === null ? null : data.price_service.toString(),
      }

      if(data.id == null){
        delete Body.id
      }
      else{
        Body.id = data.id.toString()
      }
      const purchase = await this.financeRepo.submitPurchase(Body) 
      if(purchase == null){
        return null
      }
      return purchase
    } catch (err: any) {
      console.log("errsubmitPurchase", err)
      throw err
    }
  }

  public async updatePurchase(id:string,Request:FinanceInterface):Promise<any> {
    try {

      if(Request.d_purchase_id == null){
        return null
      }


      const purchase = await this.financeRepo.updatePurchase(id,Request)
      return purchase
    } catch (err: any) {
      console.log("errupdatePurchase", err)
      throw err
    }
  }

  public async getWidhdrawalInformation(Request:Partial<any>) {
    try {
      const widhdrawalInformation = await this.financeRepo.getWidhdrawalInformation(Request)
      return {
        widhdrawalInformation,
        total: widhdrawalInformation.length
      }
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


  public async submitWidhdrawalInformation(Request:withdrawalInformaion) {
    try {
      const widhdrawalInformation = await this.financeRepo.submitWidhdrawalInformation(Request)
      return widhdrawalInformation
    } catch (err: any) {
      console.log("errsubmitWidhdrawalInformation", err)
      throw err
    }
  }

  public async updateWidhdrawalInformation(Request:Partial<any>) {
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

  


}


export default FinanceService;
