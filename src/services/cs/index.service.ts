import { Request, Response } from "express";
import CsRepository from "../../repository/cs/index.repository";
import NotificationRepository from "../../repository/notification/index.repository";


import { PrismaClient } from "@prisma/client";

import moment from 'moment'
import { fileData } from "./file";
import path from "path";
import fs from "fs";
import { RequestProductImage } from "../../interface/sale.interface";

class Csservice {
  private csRepo: CsRepository;
  private notificationRepo: NotificationRepository;
  private prisma: PrismaClient;

  constructor() {
    this.csRepo = new CsRepository();
    this.prisma = new PrismaClient();
    this.notificationRepo = new NotificationRepository();
  }


  async getPurchase(Request: Partial<any>): Promise<any> {
    try {
      const data = await this.csRepo.getPurchase(Request);
      return data;
    } catch (err: any) {
      throw new Error(err)
    }
  }

  async getPurchaseDetail(purchaseId: string): Promise<any> {
    try {
      const data = await this.csRepo.getPurchaseDetail(purchaseId);
      let response: Partial<any> = {};
      if (data == null) {
        const today = moment().format('YYYY-MM-DD');
        const existingBookNumber = await this.prisma.d_purchase.findFirst({
          where: {
            book_number: {
              startsWith: `PO${today}-`,
            },
          },
          orderBy: {
            book_number: 'desc',
          },
        });
        const bookNumberPrefix = `PO${today}-`;
        let nextNumber = 1;
        if (existingBookNumber) {
          const currentNumber = parseInt(existingBookNumber.book_number.replace(bookNumberPrefix, ''), 10);
          nextNumber = currentNumber + 1;
        }

        const formattedNumber = nextNumber.toString().padStart(4, '0');
        response.book_number = `PO${today}-${formattedNumber}`;
      } else {
        response = data;
      }


      return response;
    } catch (err: any) {
      throw err;
    }
  }

  async updateTriggleStatus(user_id: string, purchase_id: string): Promise<any> {
    try {
      const data = await this.csRepo.updateTriggleStatus(user_id, purchase_id, 'CSinjob', 'Cs รับงาน');


      const purchase_detail = await this.csRepo.getPurchaseByid(purchase_id);

      console.log('purchase_detail', purchase_detail)

      let RequestSentNotifaction = {
        user_id: purchase_detail.d_purchase_emp[0].user_id,
        purchase_id: purchase_id,
        link_to: `purchase/content/` + purchase_id,
        title: 'Cs รับงาน',
        subject_key: purchase_id,
        message: `Cs รับงาน เลขที่:${purchase_detail.book_number}`,
        status: false,
        data: {},
      }


      RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction)


      const notification = await this.notificationRepo.sendNotification(RequestSentNotifaction);


      return data;
    } catch (err: any) {
      console.log('err', err)
      throw new Error(err)
    }
  }

  async getPurchaseByid(id: string): Promise<any> {
    try {
      const data = await this.csRepo.getPurchaseByid(id);

      let SetTypeDocument = {
        route: data.d_route,
        transport: data.d_transport,
        term: data.d_term,
      }
      const getData = await this.csRepo.getDocument(SetTypeDocument)

      let filedata: any[] = []

      for (let doc of fileData) {

        Object.keys(getData).forEach((key) => {
          if (key == doc.key && getData[key] == true) {
            let file = {
              key: key,
              value: doc.value
            }
            filedata.push(file)
          }
        })

      }

      const Response = {
        purchase_id: id,
        document: filedata
      }

      return Response;
    } catch (err: any) {
      throw new Error(err)
    }
  }

  async GetAgentCy(): Promise<any> {
    try {
      const data = await this.csRepo.GetAgentCy();
      return data;
    } catch (err: any) {
      throw new Error(err)
    }
  }

  async SubmitAddAgency(Request: Partial<any>): Promise<any> {
    try {
      await this.prisma.$transaction(async (tx) => {
        try {
          const RequestSubmitAgentCy = {
            d_purchase_id: Request.purchase_id,
            agentcy_id: Request.agentcy_id,
            status: false,
            agent_boat: Request.agent_boat,
            agentcy_tit: Request.agentcy_tit,
            agentcy_etd: Request.agentcy_etd,
            agentcy_eta: Request.agentcy_eta,
            agentcy_etc: Request.agentcy_etc,

          }
          const agency = await this.csRepo.SubmitAddAgency(tx, RequestSubmitAgentCy);

          if (agency) {
            const agency_detail = await this.csRepo.SubmitAddAgencyDetail(tx, agency.id, Request.purchase_id, Request.type);

            const uploadDir = path.join(
              "public",
              "images",
              "purchase_agentcy",
              `${agency.id}`
            );
            // Create directories if they don't exist
            await fs.mkdirSync(uploadDir, { recursive: true });

            if (Request.files.length > 0) {
              for (let file of Request.files) {
                const tempFilePath = file.path;
                const d_image = {
                  file_name: file.filename,
                  file_path: uploadDir,
                  d_agentcy_id: agency.id
                };
                console.log('imagesssss', d_image)
                const fileAgency = await this.csRepo.submitAgencyFile(tx, d_image);
                if (fileAgency) {
                  const newFilePath = path.join(uploadDir, file.filename);
                  console.log("new file path", newFilePath);
                  await fs.renameSync(tempFilePath, newFilePath);
                }
              }

            }
          }

        } catch (err: any) {
          console.log('err', err)
          throw new Error(err)
        }
      })
      const response = {
        message: "บัันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };

      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }


  async UpdateAgencytoSale(Request: any[]): Promise<boolean> {
    try {

      for (let item of Request) {
        const RequestUpdate = {
          d_purchase_id: item.d_purchase_id,
          d_agentcy_id: item.id,
        }
        await this.csRepo.updateAgencytoSale(RequestUpdate);

      }


      const purchase_detail = await this.csRepo.getPurchaseByid(Request[0].d_purchase_id);

      // const userId = purchase_detail.d_emp_look

      const updateStatus = await this.csRepo.updateTriggleStatus('', purchase_detail.id, 'Bid', 'Cs เสนอราคา');



      const dataSentnotification = {
        user_id: purchase_detail.d_purchase_emp[0].user_id,
        link_to: `purchase/content/${purchase_detail.id}`,
        title: 'Cs เสนอราคา',
        subject_key: purchase_detail.id,
        message: `Cs เสนอราคา เลขที่:${purchase_detail.book_number}`,
        status: false,
        data: {},
      }


      dataSentnotification.data = JSON.stringify(dataSentnotification);
      const notification = await this.notificationRepo.sendNotification(dataSentnotification);


      return true;
    } catch (err: any) {
      console.log("errererere", err)
      throw new Error(err)
    }

  }


  async SentRequestFile(id: string, Request: Partial<any>): Promise<any> {
    try {


      const data = await this.csRepo.SentRequestFile(id, Request);


      const purchase_detail = await this.csRepo.getPurchaseByid(id);

      const notification = {
        user_id: purchase_detail.d_purchase_emp[0].user_id,
        purchase_id: id,
        link_to: `purchase/content/${id}`,
        title: 'CS ร้องขอเอกสาร',
        subject_key: id,
        message: `Cs ร้องขอเอกสาร เลขที่:${purchase_detail.book_number}`,
        status: false,
        data: {},
      }
      
      notification.data = JSON.stringify(notification)
      const dataNotification = await this.notificationRepo.sendNotification(notification);


      return data;
    } catch (err: any) {
      throw new Error(err)
    }
  }

  async submitAddpayment(RequestData:Partial<any>):Promise<any>{
    try{
      
      console.log("RequestData",RequestData);


      let createPayment :any[] = []

      for(let types of RequestData.type){

       let payment :Partial<any> ={}
        payment.payment_type = types.d_type
        payment.payment_name = types.d_type_text
        payment.payment_price = types.d_price
        payment.d_purchase_id = RequestData.purchase_id
        payment.payment_date =  new Date()
        payment.payment_currency = types.d_currency
        payment.payment_discount = types.d_discount
        payment.payment_total_price = types.d_nettotal
        payment.payment_net_balance = types.d_net_balance

        createPayment.push(payment)
      }
      const data = await this.csRepo.submitAddpayment(createPayment);

      return true;
    }
    catch(err:any){
      console.log("err",err)
      throw new Error(err)
    }
  }

}




export default Csservice;
