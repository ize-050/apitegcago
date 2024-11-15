import { Request, Response } from "express";
import Csservice from "../../services/cs/index.service";
import z from "zod";

//validate

import upload from "../../config/multerConfig";
import multer from "multer";
import moment from "moment";

export class CSController {
  private csservice;


  constructor() {
    this.csservice = new Csservice();
  }


  

  async getPurchase(req: Request, res: Response): Promise<any> {
    try {

      const page = parseInt(req.query.page as string) || 1;
      const perPage = 10;
      const skip = (page - 1) * perPage;
      const status = req.query.status as string | undefined;
      const userId = req?.userId;
      const tag = req.query.tag as string | undefined;
      const RequestData = {
        ...req.query,
        status,
        tag,
        skip,
        userId,
      };
      const data = await this.csservice.getPurchase(RequestData);
      let Purchase: any[] = []
      for (let purchase of data.purchase) {
        if (purchase.d_status === 'Sale ตีราคา') {
          purchase.color = 'bg-blue-500'
        }
        if (purchase.d_status === 'Cs รับงาน') {
          purchase.color = 'bg-[#FFC8C8]'
        }
        if (purchase.d_status === 'CS ร้องขอเอกสาร') {
          purchase.color = 'bg-red-400'
        }
        if (purchase.d_status === 'Sale แนบเอกสาร') {
          purchase.color = 'bg-red-400'
        }
        if (purchase.d_status === 'Cs เสนอราคา') {
          purchase.color = 'bg-orange-300'
        }
        if (purchase.d_status === 'ยกเลิกคำสั่งซื้อ') {
          purchase.color = 'bg-red-500'
        }
        if (purchase.d_status === 'อยู่ระหว่างทำ Financial') {
          purchase.color = 'bg-[#946A00]'
        }
        if (purchase.d_status === 'ค้างชำระเงิน') {
          purchase.color = 'bg-red-500'
        }
        if (purchase.d_status === 'ปิดการขาย') {
          purchase.color = 'bg-green-500'
        }
        if (purchase.d_status === 'ลูกค้าเครดิต') {
          purchase.color = 'bg-blue-500'
        }
        Purchase.push(purchase)
      }


      let purchaseData = {
        purchase: Purchase,
        total: data.total,
      };

      const response = {
        data: purchaseData,
        message: "ดึงข้อมูลสำเร็จ",
        statusCode: 200,
      };
      res.status(200).json(response);
    } catch (err: any) {
      console.log("err", err);
      res.status(500).json(err);
    }
  }


  async getPurchaseDetail(req: Request, res: Response): Promise<any> {
    try {
      const purchaseId = req.params.id;
      console.log("errr", purchaseId);
      const userId = req?.userId;

      const data = await this.csservice.getPurchaseDetail(purchaseId);

      if (data?.d_product?.d_product_image.length > 0) {
        data.d_product.d_product_image = data.d_product.d_product_image.map(
          (file: Partial<any>, index: number) => {
            file.name = file.d_product_image_name;
            file.purchase_id = file.purchase_id;
            file.id = file.id;
            file.url = `${process.env.URl}/images/purchase_product/${file.d_purchase_id}/${file.d_product_image_name}`;
            return file;
          }
        );
      }

      if (data.d_status === 'Sale ตีราคา') {
        data.color = 'bg-blue-500'
      }
      if (data.d_status === 'Cs รับงาน') {
        data.color = 'bg-[#FFC8C8]'
      }
      if (data.d_status === 'CS ร้องขอเอกสาร') {
        data.color = 'bg-red-400'
      }
      if (data.d_status === 'Sale แนบเอกสาร') {
        data.color = 'bg-red-400'
      }
      if (data.d_status === 'Cs เสนอราคา') {
        data.color = 'bg-red-400'
      }
      if (data.d_status === 'อยู่ระหว่างทำ Financial') {
        data.color = 'bg-[#946A00]'
      }
      if (data.d_status === 'ค้างชำระเงิน') {
        data.color = 'bg-red-500'
      }

      if (data.d_status === 'ปิดการขาย') {
        data.color = 'bg-green-500'
      }
      if (data.d_status === 'ลูกค้าเครดิต') {
        data.color = 'bg-blue-500'
      }


      const response = {
        data: data,
        message: "ดึงข้อมูลสำเร็จ",
        statusCode: 200,
      };
      res.status(200).json(response);
    } catch (err: any) {
      console.log("err", err);
      res.status(500).json(err);
    }
  }


  async updateTriggleStatus(req: Request, res: Response): Promise<any> {
    try {

      const userId = req.userId;
      const purchase_id = req.params.id;

      const data = await this.csservice.updateTriggleStatus(userId, purchase_id);
      res.status(200).json({
        data: {
          message: "เปลี่ยนสถานะสำเร็จ",
          statusCode: 200,
        },
      });
    } catch (err: any) {
      res.status(500).json(err);
    }
  }


  async getDocumentByid(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const data = await this.csservice.getPurchaseByid(id);


      res.status(200).json(data)
    }
    catch (err: any) {
      res.status(500).json(err)
    }
  }

  async getAgentCy(req: Request, res: Response): Promise<any> {
    try {
      const data = await this.csservice.GetAgentCy();

      res.status(200).json(data)
    }
    catch (err: any) {
      res.status(500).json(err)
    }
  }

  async SubmitAddAgency(req: Request, res: Response): Promise<any> {
    try {
      const RequestData = req.body
      const request = {
        ...RequestData,
        files: req.files,
        // userId: userId,
      };

      request.type = request.type.map((typeItem: any) => JSON.parse(typeItem));

      const data = await this.csservice.SubmitAddAgency(request);
      res.status(200).json({
        data: {
          message: "เพิ่มข้อมูลสำเร็จ",
          statusCode: 201,
        },
      });
    } catch (err: any) {
      console.log('err', err)
      res.status(500).json(err);
    }
  }

  async updateAgency(req: Request, res: Response): Promise<any> {
    try {
      const RequestData = req.body
      let request = {
        ...RequestData,
        files: req.files,
      };
      console.log('request',request?.type)
      if(request?.type){
        console.log('request?.type',request?.type)
        request.type = request.type.map((typeItem: any) => JSON.parse(typeItem));
      }
      const data = await this.csservice.updateAgency(request,req.params.id);


      res.status(200).json({
        data: {
          message: "อัพเดตข้อมูลสำเร็จ",
          statusCode: 201,
        },
      });
    } catch (err: any) {
      console.log('err', err)
      res.status(500).json(err);
    }
  }

  async updateAgencytoSale(req: Request, res: Response): Promise<any> {
    try {

      const Request = req.body;

      const data = await this.csservice.UpdateAgencytoSale(Request);

      res.status(200).json({
        data: {
          message: "บันทึกข้อมูลสำเร็จ",
          statusCode: 201,
        },
      });
    }
    catch (err: any) {
      res.status(500).json(err)
    }
  }


  async SentRequestFile(req: Request, res: Response): Promise<any> { //ยื่นคำร้องไฟล
    try {
      const purchase_id = req.params.id;
      const RequestData = req.body
      const request = {
        ...RequestData,

      };

      const data = await this.csservice.SentRequestFile(purchase_id, request);


      res.status(200).json({
        data: {
          message: "บันทึกข้อมูลสำเร็จ",
          statusCode: 201,
        },
      });
    } catch (err: any) {
      console.log('err', err)
      res.status(500).json(err);
    }
  }


  async submitAddpayment(req: Request, res: Response): Promise<any> {
    try {

      const Request = req.body;
      const purchase_id = req.params.id;

      const request = {
        ...Request,
        purchase_id
      }

      const submitpayment = this.csservice.submitAddpayment(request);


      res.status(200).json({
        data: {
          message: "บันทึกข้อมูลสำเร็จ",
          statusCode: 201,
        },
      });
    }
    catch (err: any) {

      res.status(500).json(err)
    }
  }
}
