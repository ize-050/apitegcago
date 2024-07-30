import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import {
  Requestcustomer,
  RequestcustomerDetail,
  RequestcustomerStatus,
  RequestPurchase,
  RequestProduct,
  Tagstatus,
  RequestProductImage,
} from "../../interface/sale.interface";

class SaleRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getCustomer(RequestData: Partial<any>): Promise<any> {
    try {
      const userId = RequestData.userId;
      const status = RequestData.status as string | undefined;
      const tag = RequestData.tag as string | undefined;
      const emp_id = RequestData.emp_id as string | undefined;

      const skip = RequestData.skip;

      const customer = await this.prisma.customer.findMany({
        skip: skip,
        take: 10,
        include: {
          details: true,
          customer_emp: true,
          customer_status: {
            orderBy: { createdAt: "desc" },
          },
        },
        where: {
          customer_emp: {
            some: { user_id: userId },
          },
          ...(tag && { cus_etc: tag }),
          ...(status && { customer_status: { some: { cus_status: status } } }),
          ...(emp_id && {
            customer_emp: {
              some: {
                user_id: emp_id,
                active: "active",
              },
            },
          }),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const Total = await this.prisma.customer.findMany({
        include: {
          details: true,
          customer_emp: true,
          customer_status: {
            orderBy: { createdAt: "desc" },
          },
        },
        where: {
          customer_emp: {
            some: { user_id: userId },
          },
          ...(tag && { customer_status: { some: { cus_status: tag } } }),
          ...(emp_id && {
            customer_emp: {
              some: {
                user_id: emp_id,
                active: "active",
              },
            },
          }),
        },
      });
      const data = {
        customer: customer,
        total: Total.length,
      };
      return data;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getCustomerDetail(customerId: string): Promise<any> {
    try {
      return await this.prisma.customer.findUnique({
        where: {
          id: customerId,
        },
        include: {
          details: true,
          customer_status: {
            where: {
              active: "active",
            },
          },
          customer_emp: {
            where: {
              active: "active",
            },
            include: {
              user: true,
            },
          },
        },
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createCustomer(RequestData: Partial<any>): Promise<any> {
    try {
      const customer: Requestcustomer = {
        cus_fullname: RequestData.cus_fullname,
        cus_phone: RequestData.cus_phone,
        cus_line: RequestData.cus_line,
        cus_website: RequestData.cus_website,
        cus_etc: RequestData.cus_etc,
      };

      const InsertCustomer = await this.prisma.customer.create({
        data: customer,
      });

      if (InsertCustomer) {
        const InsertCustomerDetail = await this.prisma.customer_detail.create({
          data: {
            customer_id: InsertCustomer.id,
            cd_company: RequestData.cd_company,
          },
        });

        const CustomerStatus: RequestcustomerStatus = {
          customer_id: InsertCustomer.id,
          cus_status: RequestData.cus_status,
          active: "active",
        };
        const InsertCustomerStatus = await this.prisma.customer_status.create({
          data: CustomerStatus,
        });

        const InsertCustomerEmp = await this.prisma.customer_emp.create({
          data: {
            customer_id: InsertCustomer.id,
            user_id: RequestData.userId,
            cus_status: "Assigned",
            active: "active",
          },
        });

        // const insertStatus = await this.prisma.d_purchase_status.create({
        //   data: {
        //     customer_id: InsertCustomer.id,
        //     status_name: "กำลังดูแล",
        //     active: true,
        //   },
        // }); //ยังไม่ได้ใช้แล้ว
      }

      return InsertCustomer;
    } catch (err: any) {
      console.log('createCustomerError',err)
      throw new Error(err);
    }
  }

  async editCustomer(RequestData: Partial<any>): Promise<any> {
    try {
      const status = {
        customer_id: RequestData.customer_id,
        status: RequestData.cus_status,
      };

      const CheckStatus = await this.prisma.customer_status.findFirst({
        where: {
          customer_id: RequestData.customer_id,
          active: "active",
          cus_status: RequestData.cus_status,
        },
      });

      if (!CheckStatus) {
        await this.changeTagStatus(status);
      } else {
        console.log("not change");
      }

      const customer: Requestcustomer = {
        cus_fullname: RequestData.cus_fullname,
        cus_phone: RequestData.cus_phone,
        cus_line: RequestData.cus_line,
        cus_website: RequestData.cus_website,
        cus_etc: RequestData.cus_etc,
        cus_age: RequestData.cus_age,
        cus_international: RequestData.cus_international,
        cus_facebook: RequestData.cus_facebook,
        cus_wechat: RequestData.cus_wechat,
        cus_sex: RequestData.cus_sex,
        updatedAt: new Date(),
      };

      const UpdateCustomer = await this.prisma.customer.update({
        where: {
          id: RequestData.customer_id,
        },
        data: customer,
      });

      console.log('cd_group_id',RequestData.cd_group_id)
      if (UpdateCustomer) {
        let CustomerDetail: RequestcustomerDetail = {
          customer_id: RequestData.customer_id,
          cd_consider: RequestData.cd_consider,
          cd_company: RequestData.cd_company,
          cd_group_id : RequestData.cd_group_id,
          cd_typeinout: RequestData.cd_typeinout,
          cd_custype: RequestData.cd_custype,
          cd_cusservice: RequestData.cd_cusservice,
          cd_department: RequestData.cd_department,
          cd_channels: RequestData.cd_channels,
          cd_num: RequestData.cd_num,
          cd_capital: RequestData.cd_capital,
          cd_emp: RequestData.cd_emp,
          cd_shareholders: RequestData.cd_shareholders,
          cd_address: RequestData.cd_address,
          cd_num_saka: RequestData.cd_num_saka,
          cd_frequency: RequestData.cd_frequency,
          status_update: true,
          cd_leader: RequestData.cd_leader,
          cd_priority: RequestData.cd_priority,
          updatedAt: new Date(),
        };

        const UpdateCustomerDetail = await this.prisma.customer_detail.update({
          where: {
            customer_id: RequestData.customer_id,
          },
          data: CustomerDetail,
        });


      // }
    }

      return UpdateCustomer;
    } catch (err: any) {
      console.log("errupdate", err);
      throw err;
    }
  }

  async changeTagStatus(RequestStatus: Partial<any>): Promise<any> {
    try {
      const customerId = RequestStatus.customer_id;
      const statusString: Tagstatus = RequestStatus.status;

      const UpdateStatus = await this.prisma.customer_status.updateMany({
        //เปลี่ยนสถานะเป็น nonactive ล่าสุด
        where: {
          customer_id: customerId,
        },
        data: {
          active: "nonactive",
          updatedAt: new Date(),
        },
      });

      if (UpdateStatus) {
        await this.prisma.customer_status.create({
          data: {
            customer_id: customerId,
            cus_status: statusString,
            active: "active",
          },
        });
      }
    } catch (err: any) {
      console.log("err", err);
      throw new Error(err);
    }
  }


  async getAllEstimate(RequestData:any): Promise<any> {
    try {
      console.log('dfgsdfsdfs',RequestData.userId);
      const purchase =  await this.prisma.d_purchase.findMany({
        skip: RequestData.skip,
        take: 10,
        where:{
          d_purchase_emp:{
            some:{
              user_id: RequestData.userId
            }
          }
        },
        
        include: {
          d_product: {
            include: {
              d_product_image: true,
            },
          },
          customer: true,
          d_purchase_emp:{
            where:{
              user_id: RequestData.userId
            }
          }
        },
      });

      const Total = await this.prisma.d_purchase.findMany({
          include:{
            d_purchase_emp:{
              where: {
                user_id: RequestData.userId
              }
            }
          }
      });
      const data = {
        purchase: purchase,
        total: Total.length,
      };

      return data
    } catch (err: any) {
      throw new Error(err);
    }
  }
  async getEstimate(purchaseId: string): Promise<any> {
    try {
      return await this.prisma.d_purchase.findFirst({
        where: {
          id: purchaseId,
        },
        include: {
          d_product: {
            include: {
              d_product_image: true,
            },
          },
          d_purchase_status:{
            where:{
              active:true
            }
          },
          d_purchase_emp:{
            include: {
              user: true
            },
          },
          d_agentcy:{
            where:{
              status:true
            },
            include:{
              agentcy:true,
              d_agentcy_detail:true,
              d_agentcy_file:true
            }
          },
           d_document:true,
           customer:{
            include:{
              details:true
            }
          },
          },
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async submitEstimate(tx: any, RequestData: RequestPurchase): Promise<any> {
    try {
      console.log("submit", RequestData);
      return await tx.d_purchase.create({
        data: RequestData,
      });


    } catch (err: any) {
      console.log("err", err);
      throw new Error(err);
    }
  }

  async submitEstimateProduct(
    tx: any,
    RequestData: RequestProduct
  ): Promise<any> {
    try {
      return await tx.d_product.create({
        data: RequestData,
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async submitEstimateProductImage(
    tx: any,
    RequestData: RequestProductImage
  ): Promise<any> {
    try {
      return await tx.d_product_image.create({
        data: RequestData,
      });
    } catch (err: any) {
      console.log("errcreateimage", err);
      throw new Error(err);
    }
  }

  async ChangeStatus(tx:any,purchase_id: string): Promise<any> {
    try{

        const d_status = await tx.d_purchase_status.findFirst({
          where:{
            d_purchase_id:purchase_id,
            active:true
          }
        })

        if(d_status){
          const UpdateStatus = await tx.d_purchase_status.update({
            where:{
              id:d_status.id
            },
            data:{
              active:false,
              updatedAt:new Date()
            }
          })
        }
          const insertStatus = await tx.d_purchase_status.create({
            data: {
              d_purchase_id: purchase_id,
              status_name: "อยู่ระหว่างดำเนินการ",
              active: true,
            },
          });
        
      return insertStatus;
    }
    catch(e:any){
      throw new Error(e);
    }
  }


  async getCheckbooking(): Promise<any> {
    try {
      return await this.prisma.d_purchase.findMany({
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }


  async submitPurchaseemployee(tx:any,purchase_id:string,employee_id:string):Promise<any>{
    try{
      console.log('purchase_id',purchase_id)
        return    tx.d_purchase_emp.create({
          data:{
            user_id:employee_id,
            d_purchase_id:purchase_id,
          }
        })
    }
    catch(e:any){
      throw new Error(e)
    }
  }



}



export default SaleRepository;
