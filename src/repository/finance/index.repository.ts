import { PrismaClient ,withdrawalInformaion } from "@prisma/client";
import moment from "moment";

//interface 

import { FinanceInterface } from "../../services/finance/dto/finance.interface"

class FinanceRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async getPurchaseBysearch(search:string):Promise<any>{
    try{
      const purchase :any = await this.prisma.d_purchase.findMany({
        where: {
          d_shipment_number: {
            contains: search
          }
        },
        include:{
          cs_purchase:{
            where:{
              status_key :'Bookcabinet'
            },
            include:{
              bookcabinet:true,
            }
          },
        }
      })
      return purchase
    }
    catch(err:any){
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
          purchase_finance:true
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
          d_purchase_emp:{
            include:{
              user:true
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
              bookcabinet:true,

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

      console.log("Rqwqeqwewq",Request.id)

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
      const widhdrawalInformation = await this.prisma.withdrawalInformaion.findMany({
        skip: (Request.page - 1) * 10,
        take: 10,
      })


      const total = await  this.prisma.withdrawalInformaion.findMany({ 

      });

      return {
        widhdrawalInformation,
        total
      }
    } catch (err: any) {
      console.log("errgetWidhdrawalInformation", err)
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

  public async submitWidhdrawalInformation(Request: withdrawalInformaion): Promise<any> {
    try {
      const widhdrawalInformation = await this.prisma.withdrawalInformaion.create({
        data: {
          ...Request
        }
      })


      return widhdrawalInformation
    } catch (err: any) {
      console.log("errsubmitWidhdrawalInformation", err)
      throw err
    }
  }

  public async updateWidhdrawalInformation(Request: Partial<any>): Promise<any> {
    try {
      const widhdrawalInformation = await this.prisma.withdrawalInformaion.update({
        where: {
          id: Request.id
        },
        data: {
          ...Request
        }
      })
      return widhdrawalInformation
    } catch (err: any) {
      console.log("errupdateWidhdrawalInformation", err)
      throw err
    }
  }

  public async deleteWithdrawalInformation(id: string): Promise<any> {
    try {
      const widhdrawalInformation = await this.prisma.withdrawalInformaion.delete({
        where: {
          id: id
        }
      })
      return widhdrawalInformation
    } catch (err: any) {
      console.log("errdeleteWithdrawalInformation", err)
      throw err
    }
  }
}

export default FinanceRepository;
