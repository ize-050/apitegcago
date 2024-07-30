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
      const tag = req.query.tag as string | undefined;
      const RequestData = {
        ...req.query,
        status,
        tag,
        skip,
      };
      const data = await this.csservice.getPurchase(RequestData);
      let Purchase :any[] = []
      for(let purchase of data.purchase){
        if(purchase.d_status === `อยู่ระหว่างดำเนินการ`){
          purchase.color = 'bg-blue-500'
        }
        if(purchase.d_status === 'CS กำลังดำเนินการ'){
          purchase.color = 'bg-red-400'
        }
        if(purchase.d_status === 'ยกเลิก'){
          purchase.color = 'bg-red-400'
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

        if(data.d_status === `อยู่ระหว่างดำเนินการ`){
          data.color = 'bg-blue-500'
        }
        else if(data.d_status === 'CS กำลังดำเนินการ'){
          data.color = 'bg-red-400'
        }
        else if(data.d_status === 'ยกเลิก'){
          data.color = 'bg-red-400'
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

      const data = await this.csservice.updateTriggleStatus(userId,purchase_id);
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
    try{
      const id = req.params.id;
      const data = await this.csservice.getPurchaseByid(id);


      res.status(200).json(data)
    }
    catch(err:any){
      res.status(500).json(err)
    }
  }

  async getAgentCy(req: Request, res: Response): Promise<any> {
    try{
      const data = await this.csservice.GetAgentCy();

      res.status(200).json(data)
    }
    catch(err:any){
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

      request.type = request.type.map((typeItem:any) => JSON.parse(typeItem));

       const data = await this.csservice.SubmitAddAgency(request);
      res.status(200).json({
        data: {
          message: "เพิ่มข้อมูลสำเร็จ",
          statusCode: 201,
        },
      });
    } catch (err: any) {
      console.log('err',err)
      res.status(500).json(err);
    }
  }

  async updateAgencytoSale(req: Request, res: Response): Promise<any> {
    try{

      const Request = req.body;

      const data = await this.csservice.UpdateAgencytoSale(Request);

      res.status(200).json({
        data: {
          message: "บันทึกข้อมูลสำเร็จ",
          statusCode: 201,
        },
      });
    }
    catch(err:any){
      res.status(500).json(err)
    }
  }


  async SentRequestFile(req: Request, res: Response): Promise<any> { //ยื่นคำร้องไฟล
    try {
      const purchase_id = req.params.id;
      const RequestData = req.body
 

      const data = await this.csservice.SentRequestFile(purchase_id,RequestData);
      
      res.status(200).json({
        data: {
          message: "บันทึกข้อมูลสำเร็จ",
          statusCode: 201,
        },
      });
    } catch (err: any) {
      console.log('err',err)
      res.status(500).json(err);
    }
  }


}