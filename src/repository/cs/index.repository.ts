import { PrismaClient } from "@prisma/client";
import moment from "moment";

class CsRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllCs(Request: Partial<any>): Promise<any> {
    try {
      const data = await this.prisma.d_purchase.findMany({
        where: {
          d_status: {
            in: ['ปิดการขาย', 'ลูกค้าเครดิต', 'ค้างชำระเงิน'] // Include multiple statuses
          }
        },
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        skip: Request.skip,
      });

      const total = await this.prisma.d_purchase.count({
        where: {
          d_status: {
            in: ['ปิดการขาย', 'ลูกค้าเครดิต', 'ค้างชำระเงิน'] // Include multiple statuses
          }
        },
      });
      return { data, total };
    } catch (err: any) {
      throw new Error(err)
    }
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
        orderBy: [
          { createdAt: 'desc' }, // Primary sorting by createdAt
          { d_shipment_number: 'asc' } // Secondary sorting by d_shipment_number
        ],
      });

      const Total = await this.prisma.d_purchase.findMany({});

      purchase.sort((a: any, b: any) => {
        const extractParts = (shipmentNumber: string | null | undefined) => {
          if (!shipmentNumber || shipmentNumber === '-') {
            return { prefix: '', number: Infinity }; 
          }
          const match = shipmentNumber.match(/([A-Z]+)(\d+)-(\d+)-(\d+)/);
          return match ? { 
            prefix: match[1] || '', 
            number: parseInt(match[2], 10)
          } : { prefix: '', number: Infinity };
        };

        const partA = extractParts(a.d_shipment_number);
        const partB = extractParts(b.d_shipment_number);

        // If either has no shipment number (is '-'), prioritize by date
        if ((!a.d_shipment_number || a.d_shipment_number === '-') || 
            (!b.d_shipment_number || b.d_shipment_number === '-')) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        // If both have shipment numbers, compare by number
        return partA.number - partB.number;
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

  async updateAgency(tx:any,Request: Partial<any>, id: string): Promise<any> {
    try { 
      return await tx.d_agentcy.update({
        where: { id },
        data: Request,
      });
    } catch (e: any) {
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

  async updateAgencyDetail(tx: any, RequestData:any[],  id: string): Promise<any> {
    try {

      const purchase_id = await tx.d_agentcy_detail.findMany({
        where: { d_agentcy_id: id },
      })
   
      await tx.d_agentcy_detail.deleteMany({
        where: { d_agentcy_id: id },
      });


      console.log("RequestData", RequestData)
      for (const item of RequestData) {
        await tx.d_agentcy_detail.createMany({
          data: {
            ...item,
            d_agentcy_id: id,
            d_purchase_id: purchase_id[0].d_purchase_id,
            d_nettotal: item.d_nettotal,
            d_net_balance: item.d_net_balance,
            d_discount: '',
            d_price: item.d_price,
            d_type: item.d_type,
            d_typePayer: item.d_typePayer,
            d_type_text: item.d_type_text,
          },
        });
      }
      return true
    } catch (e: any) {
      console.log('err',e)
      throw new Error(e);
    }
  }

  async getDataAgencyPicture(tx: any, id: string, existingImageIds: string[]): Promise<any> {
    try {
      return await tx.d_agentcy_file.findMany({
        where: { 
          d_agentcy_id: id,
          id: {
            not : {
              in: existingImageIds
          },
        }, },
      });
    } catch (e: any) {
      throw new Error(e);
    }
  }

  async updateAgencyFile(tx: any, RequestData: Partial<any>): Promise<any> {
    try {
      return await tx.d_agentcy_file.update({
        where: { id: RequestData.id },
        data: RequestData,
      });
    } catch (e: any) {
      throw new Error(e);
    }
  }


  async deleteAgencyFile(tx: any, existingImageIds: string): Promise<any> {
    try {
      return await tx.d_agentcy_file.delete({
        where: { id:existingImageIds},
      });
    } catch (e: any) {
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
          
          await tx.d_purchase.update({
            where: {
              id: purchase_id,
            },
            data: {
              d_group_work: Request.d_group_work,
              d_end_date: new Date(),
              d_num_date: "30",
              d_status: "CS ร้องขอเอกสาร",
              input_etc: Request.input_etc,
            },
          });

          const Document = Request.document_type;
        
          await tx.d_document.createMany({
            data: [
              ...Document.map((item: any) => ({
                d_document_name: item.value,
                d_document_key: item.key,
                d_purchase_id: purchase_id,
                d_document_etc: item.key === 'document_etc' ? Request.input_etc : null,
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
  async getTransport(id: string): Promise<any> {
    return await this.prisma.d_purchase.findFirst({
      where: { id },
      select: { d_transport: true },
    });
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
