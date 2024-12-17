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

import moment from "moment";

class SaleRepository {
  
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async checkShipmentNumber(d_transport: string): Promise<any> {
    const today = moment().format('YYMMDD')
    const existingBookNumber :any = await this.prisma.d_purchase.findFirst({
      where: {
        d_shipment_number: {
          startsWith: `${d_transport}001`,
        },
      },
      select: {
        d_shipment_number: true
        }
    });
    
    return existingBookNumber?.d_shipment_number
  }

  async checkShipmentNumberLast(d_transport: string): Promise<any> {
    const existingBookNumber :any = await this.prisma.d_purchase.findFirst({
      where: {
        d_shipment_number: {
          startsWith: `${d_transport}`,
        },
      },
      orderBy: {
        d_shipment_number: "desc", // Order by the entire shipment number
      },
    });
    return existingBookNumber?.d_shipment_number
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
        cus_code: RequestData.cus_code,
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
      console.log("createCustomerError", err);
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

      const customer = {
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

      console.log("cd_group_id", RequestData.cd_group_id);
      if (UpdateCustomer) {
        let CustomerDetail: RequestcustomerDetail = {
          customer_id: RequestData.customer_id,
          cd_consider: RequestData.cd_consider,
          cd_company: RequestData.cd_company,
          cd_group_id: RequestData.cd_group_id,
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


  async getEmpAllCS(): Promise<any> {
    return await this.prisma.user.findMany({
      where: {
        roles: {
          is: { roles_name: "Cs" }
        }
      }
    })
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

  async getAllEstimate(RequestData: any): Promise<any> {
    try {
      console.log("dfgsdfsdfs", RequestData.userId);
      const purchase = await this.prisma.d_purchase.findMany({
        skip: RequestData.skip,
        take: 10,
        where: {
          d_purchase_emp: {
            some: {
              user_id: RequestData.userId,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          d_product: {
            include: {
              d_product_image: true,
            },
          },
          customer: true,
          d_purchase_emp: {
            where: {
              user_id: RequestData.userId,
            },
          },
        },
      });

      const Total = await this.prisma.d_purchase.findMany({
        where: {
          d_purchase_emp: {
            some: {
              user_id: RequestData.userId,
            },
          },
        }
      });
      const data = {
        purchase: purchase,
        total: Total.length,
      };

      return data;
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
          d_purchase_status: {
            where: {
              active: true,
            },
          },
          d_purchase_emp: {
            where: {
              is_active: true,
            },
            include: {
              user: true,
            },
          },
          d_agentcy: {
            where: {
              status: true,
            },
            include: {
              agentcy: true,
              d_agentcy_detail: {
                orderBy: {
                  id: "desc",
                },
              },
              d_agentcy_file: true,
            },
          },
          d_document: {
            include: {
              d_document_file: true,
            },
          },
          customer: {
            include: {
              details: true,
            },
          },
          d_sale_agentcy: {
            where: {
              status: true,
            },
            include: {
              d_agentcy: {
                include: {
                  d_agentcy_detail: {
                    orderBy: {
                      id: "desc",
                    },
                  },
                  agentcy: true,
                },
              },
              d_sale_agentcy_file: true,
            },
          },
          payment_purchase: true,
          d_confirm_purchase: {
            include: {
              d_confirm_purchase_file: true,
            },
          },
          d_purchase_customer_payment: true,
        },
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getEmployee(employeeId: string): Promise<any> {
    //เซลลที่ไม่ใช่เรา
    try {
      return await this.prisma.user.findMany({
        where: {
          id: {
            not: employeeId,
          },
          roles: {
            is: {
              roles_name: "Sales",
            },
          },
        },
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async cancelEstimate(RequestData: Partial<any>): Promise<any> {
    try {
      await this.prisma
        .$transaction(async (tx) => {
          const purchaseId = RequestData.purchase_id;
          await this.ChangePurchaseStatus(
            tx,
            purchaseId,
            "Cancel",
            "ยกเลิกคำสั่งซื้อ"
          );
        })
        .catch((err: any) => {
          throw new Error(err);
        });

      return true;
    } catch (err: any) {
      console.log("eeeeee", err);
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

  async applyEmployee(RequestData: Partial<any>): Promise<any> {
    try {
      const data = await this.prisma.$transaction(async (tx: any) => {
        await tx.d_purchase_emp.create({
          data: {
            d_purchase_id: RequestData.id,
            user_id: RequestData.employeeId,
            is_active: false,
          },
        });

        await tx.d_purchase.update({
          where: {
            id: RequestData.id,
          },
          data: {
            is_update_emp: true,
          },
        });


        const notificationData = {
          user_id: RequestData.employeeId,
          title: "ส่งมอบหมายงาน",
          subject_key: RequestData.id,
          message: "ส่งมอบหมายงาน เลขที่: " + RequestData.book_number,
          status: false,
          link_to: "purchase",
        }
        await tx.notification.create({
          data: {
            ...notificationData,
            data: JSON.stringify(notificationData),
          },
        });
      });
      return data;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async acceptJob(id: string, RequestData: Partial<any>): Promise<any> {
    try {
      const data = await this.prisma.$transaction(async (tx: any) => {
        await tx.d_purchase_emp.updateMany({
          where: {
            d_purchase_id: id,
            user_id: RequestData.userId,
          },
          data: {
            is_active: RequestData.is_active,
          },
        });

        await tx.d_purchase_emp.deleteMany({
          where: {
            d_purchase_id: id,
            user_id: {
              not: RequestData.userId,
            },
          },
        });

        await tx.d_purchase.update({
          where: {
            id: id,
          },
          data: {
            is_update_emp: false,
          },
        });

      });
      return data;
    } catch (err: any) {
      console.log("erraccept", err);
      throw new Error(err);
    }
  }

  async cancelJob(id: string, user_id: string): Promise<any> {
    try {
      const data = await this.prisma.$transaction(async (tx: any) => {
        await tx.d_purchase_emp.deleteMany({
          where: { d_purchase_id: id, user_id: user_id },
        });

        await tx.d_purchase.update({
          where: {
            id: id,
          },
          data: {
            is_update_emp: false,
          },
        });
      });
      return data;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateEstimate(
    tx: any,
    id: string,
    RequestData: RequestPurchase
  ): Promise<any> {
    try {
      const data = await tx.d_purchase.update({
        where: {
          id: id,
        },
        data: RequestData,
      });

      return data;
    } catch (err: any) {
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

  async updateEstimateProduct(
    tx: any,
    id: string,
    RequestData: RequestProduct
  ): Promise<any> {
    try {
      const data = await tx.d_product.update({
        where: {
          d_purchase_id: id,
        },
        data: RequestData,
      });

      return data;
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

  async checkEdit(tx: any, id: string, IdnoChange: any): Promise<any> {
    try {
      return await this.prisma.d_product_image.findMany({
        where: {
          d_purchase_id: id,
          id: {
            notIn: IdnoChange,
          },
        },
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async submitEstimateDocumentfile(data: any): Promise<any> {
    try {
      return await this.prisma.d_document_file.create({
        data: data,
      });
    } catch (err: any) {
      throw new Error(err);
    }
  } //บันทึกข้อมูลไฟล

  async deleteImage(tx: any, id: string): Promise<any> {
    try {
      return await tx.d_product_image.delete({
        where: {
          id: id,
        },
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateEstimateProductImage(
    tx: any,
    id: string,
    RequestData: RequestProductImage
  ): Promise<any> {
    try {
      const data = await tx.d_product_image.create({
        data: RequestData,
      });

      return data;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async ChangeStatus(tx: any, purchase_id: string): Promise<any> {
    try {
      const d_status = await tx.d_purchase_status.findFirst({
        where: {
          d_purchase_id: purchase_id,
          active: true,
        },
      });

      if (d_status) {
        const UpdateStatus = await tx.d_purchase_status.update({
          where: {
            id: d_status.id,
          },
          data: {
            active: false,
            updatedAt: new Date(),
          },
        });
      }

      const insertStatus = await tx.d_purchase_status.create({
        data: {
          d_purchase_id: purchase_id,
          status_key: "Estimate",
          status_name: "Sale ตีราคา",
          active: true,
        },
      });

      return insertStatus;
    } catch (e: any) {
      throw new Error(e);
    }
  }

  async getImageName(tx: any, purchase_id: string): Promise<any> {
    try {
      return await tx.d_product_image.findMany({
        where: {
          d_purchase_id: purchase_id,
        },
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getCheckbooking(): Promise<any> {
    try {
      return await this.prisma.d_purchase.findMany({});
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async submitPurchaseemployee(
    tx: any,
    purchase_id: string,
    employee_id: string
  ): Promise<any> {
    try {
      console.log("purchase_id", purchase_id);
      return tx.d_purchase_emp.create({
        data: {
          user_id: employee_id,
          d_purchase_id: purchase_id,
        },
      });
    } catch (e: any) {
      throw new Error(e);
    }
  }

  async ChangePurchaseStatus(
    tx: any,
    purchase_id: string,
    status_key: string,
    status: string
  ): Promise<any> {
    //ปรับสถานะเสมอ
    try {
      const data = await tx.d_purchase.update({
        where: {
          id: purchase_id,
        },
        data: {
          d_status: status,
          updatedAt: new Date(),
        },
      });

      if (data) {
        await tx.d_purchase_status.updateMany({
          where: {
            d_purchase_id: purchase_id,
            updatedAt: new Date(),
          },
          data: {
            active: false,
          },
        });

        await tx.d_purchase_status.create({
          data: {
            d_purchase_id: purchase_id,
            status_key: status_key,
            status_name: status,
            active: true,
            createdAt: new Date(),
          },
        });
      }

      return data;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async submitAddorderPurchase(
    tx: any,
    RequestData: Partial<any>
  ): Promise<any> {
    try {
      return await tx.d_sale_agentcy.create({
        data: {
          d_agentcy_id: RequestData.d_agentcy_id,
          d_purchase_id: RequestData.d_purchase_id,
          status: RequestData.status,
        },
      });
    } catch (err: any) {
      console.log("errorsubmitorder", err);
      throw new Error(err);
    }
  }
}

export default SaleRepository;
