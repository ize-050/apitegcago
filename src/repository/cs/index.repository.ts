import { PrismaClient, customer } from "@prisma/client";
import moment from "moment";

class CsRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getPurchase(Request: Partial<any>): Promise<any> {
    try {
      const purchase = await this.prisma.d_purchase.findMany({
        take: 10,
        skip: Request.skip,
        include: {
          d_purchase_emp: {
            include: {
              user: true,
            },
          },
          d_purchase_status: true,
          
        },
        where: {
          OR: [
            { d_status: 'Sale ตีราคา' },
            {
              d_emp_look: Request.userId,
              NOT: {
                d_status: 'Sale ตีราคา'
              }
            }
          ]
        },
      });

      const Total = await this.prisma.d_purchase.findMany({});

      const data = {
        purchase: purchase,
        total: Total.length,
      };

      return data;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getPurchaseDetail(purchaseId: string): Promise<any> {
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
          payment_purchase: true,
          d_purchase_status: {
            where: {
              active: true,
            },
          },
          d_purchase_emp: {
            include: {
              user: true,
            },
          },
          d_agentcy: {
            include: {
              agentcy: true,
              d_agentcy_detail: true,
              d_agentcy_file: true,
            },
          },
          d_document: {
            include: {
              d_document_file: true,
            }
          },
          customer: {
            include: {
              details: true,
            },
          },
          d_confirm_purchase:{
            include: {
              d_confirm_purchase_file: true,
            }
          },
          d_purchase_customer_payment: true,
          d_sale_agentcy: {
            where: {
              status: true,
            },
            include: {
              d_agentcy: {
                include:{
                  d_agentcy_detail: {
                    orderBy:{
                      id: 'desc'
                    },
                  },
                  agentcy: true,
                }
              },
              d_sale_agentcy_file: true
            }
          },
        },

      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getPurchaseByid(id: string): Promise<any> {
    try {
      const data = await this.prisma.d_purchase.findFirst({
        where: {
          id: id,
        },
        include: {
          d_purchase_emp: {
            include: {
              user: true,
            },
          },
          d_purchase_status: true,
          d_product: {
            include: {
              d_product_image: true,
            },
          },
        },
      });
      return data;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateTriggleStatus(
    user_id: string,
    purchase_id: string,
    key: string,
    status: string
  ): Promise<any> {
    try {
      let data;
      if (user_id != "") {
        data = await this.prisma.d_purchase.update({
          where: {
            id: purchase_id,
          },
          data: {
            d_status: status,
            d_emp_look: user_id,
            updatedAt: new Date(),
          },
        });

      }
      else {
        data = await this.prisma.d_purchase.update({
          where: {
            id: purchase_id,
          },
          data: {
            d_status: status,
            updatedAt: new Date(),
          },
        });
      }

      if (data) {
        await this.prisma
          .$transaction(async (tx) => {
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
                status_key: key,
                status_name: status,
                active: true,
                createdAt: new Date(),
              },
            });
          })
          .catch((err) => {
            throw new Error(err);
          });
      }

      return data;
    } catch (err: any) {
      console.log("error update status", err)
      throw new Error(err);
    }
  }

  async getDocument(Request: Partial<any>): Promise<any> {
    try {
      const data = await this.prisma.document.findFirst({
        where: {
          documennt_type: Request.transport,
          type_master: Request.route,
          key: Request.term,
        },
      });
      return data;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async GetAgentCy(): Promise<any> {
    try {
      const data = await this.prisma.agentcy.findMany();
      return data;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async SubmitAddAgency(tx: any, RequestData: Partial<any>): Promise<any> {
    try {
      return await tx.d_agentcy.create({
        data: RequestData,
      });
    } catch (e: any) {
      console.log("ersubmit", e);
      throw new Error(e);
    }
  }

  async SubmitAddAgencyDetail(
    tx: any,
    agent_id: string,
    purchase_id: string,
    RequestData: Partial<any>
  ): Promise<any> {
    try {
      return await tx.d_agentcy_detail.createMany({
        data: [
          ...RequestData.map((item: any) => ({
            ...item,
            d_agentcy_id: agent_id,
            d_purchase_id: purchase_id,
          })),
        ],
      });
    } catch (e: any) {
      console.log("ersubmitdetail", e);
      throw new Error(e);
    }
  }

  async submitAgencyFile(tx: any, RequestData: Partial<any>): Promise<any> {
    console.log("RequestData", RequestData);
    try {
      return await tx.d_agentcy_file.create({
        data: {
          ...RequestData,
        },
      });
    } catch (e: any) {
      throw new Error(e);
    }
  }

  async updateAgencytoSale(Request: Partial<any>): Promise<any> {
    try {
      return await this.prisma.d_agentcy.update({
        where: {
          id: Request.d_agentcy_id,
        },
        data: {
          status: true,
        },
      });
    } catch (e: any) {
      console.log("e", e);
      throw new Error(e);
    }
  }

  async SentRequestFile(
    purchase_id: string,
    Request: Partial<any>
  ): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        try {
          const Dates = new Date(Request.d_end_date);

          await tx.d_purchase.update({
            where: {
              id: purchase_id,
            },
            data: {
              d_group_work: Request.d_group_work,
              d_end_date: Dates,
              d_num_date: Request.d_num_date,
              d_status: "CS ร้องขอเอกสาร",
            },
          });


          const Document = Request.document_type;
          await tx.d_document.createMany({
            data: [
              ...Document.map((item: any) => ({
                d_document_name: item.value,
                d_document_key: item.key,
                d_purchase_id: purchase_id,
              })),
            ],
          });

          await tx.d_purchase_status.updateMany({
            where: {
              d_purchase_id: purchase_id,
            },
            data: {
              active: false,
            },
          });

          await tx.d_purchase_status.create({
            data: {
              d_purchase_id: purchase_id,
              status_key: "Wait_document",
              status_name: "CS ร้องขอเอกสาร",
              active: true,
              createdAt: new Date(),
            },
          });
        } catch (err: any) {
          throw new Error(err);
        }


      });

      return true;
    } catch (err: any) {
      console.log("errorSentRequestFile", err);
      throw new Error(err);
    }
  }

  async submitAddpayment(RequestData: Partial<any>): Promise<any> {
    try {

      await this.prisma.$transaction(async (tx) => {

        const payment = await tx.payment_purchase.findMany({
          where: {
            d_purchase_id: RequestData[0].d_purchase_id,
          },
        });

        if (payment.length > 0) {
          await tx.payment_purchase.deleteMany({
            where: {
              d_purchase_id: RequestData[0].d_purchase_id,
            },
          });
        }

        await tx.payment_purchase.createMany({
          data: [
            ...RequestData.map((item: any) => ({
              ...item,
            })),
          ],
        })
      }).catch((err) => {
        throw new Error(err);
      })
    }
    catch (err: any) {
      console.log("Faied payment")
      throw new Error(err)
    }
  }
}

export default CsRepository;
