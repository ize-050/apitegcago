import { Request, Response } from "express";
import SaleService from "../../services/sale/index.service";
import z from "zod";

//validate
import {
  ValidationCreateCustomer,
  ValidationEditCustomer,
  ValidationsubmitEstimate,
} from "../../validation/validationSchema";
import upload from "../../config/multerConfig";
import multer from "multer";
export class SaleController {
  private saleservice;
  constructor() {
    this.saleservice = new SaleService();
  }

  async getCustomer(req: Request, res: Response): Promise<any> {
    try {
      const userId = req?.userId;

      const page = parseInt(req.query.page as string) || 1;

      const perPage = 10;
      const skip = (page - 1) * perPage;

      const status = req.query.status as string | undefined;
      const tag = req.query.tag as string | undefined;

      const RequestData = {
        ...req.query,
        userId: userId,
      };

      const data = await this.saleservice.getCustomer(RequestData);
      res.json({
        data: {
          users: data,
          message: "success",
          statusCode: 200,
        },
      });
    } catch (err: any) {
      res.status(500).json(err);
    }
  }

  async createCustomer(req: Request, res: Response): Promise<any> {
    try {
      const validatedData = ValidationCreateCustomer.safeParse(req.body);

      if (!validatedData.success) {
        res.status(400).json({ errors: validatedData.error.issues });
      }

      const userId = req?.userId;
      let RequestData = req.body;

      const request = {
        ...RequestData,
        userId: userId,
      };

      const response = await this.saleservice.createCustomer(request);

      res.status(200).json({
        data: {
          message: "เพิ่มข้อมูลสำเร็จ",
          statusCode: 201,
        },
      });
    } catch (err: any) {
      res.status(500).json(err);
    }
  }

  async editCustomer(req: Request, res: Response): Promise<any> {
    try {
      const validatedData = ValidationEditCustomer.safeParse(req.body);

      const customerId = req.params.id;

      if (!validatedData.success) {
        res.status(400).json({ errors: validatedData.error.issues });
      }

      const userId = req?.userId;
      let RequestData = req.body;

      const request = {
        ...RequestData,
        customer_id: customerId,
        // userId: userId,
      };

      const response = await this.saleservice.editCustomer(request);

      res.status(200).json({
        data: {
          message: "เพิ่มข้อมูลสำเร็จ",
          statusCode: 201,
        },
      });
    } catch (err: any) {
      res.status(500).json(err);
    }
  }

  async changeTagStatus(req: Request, res: Response): Promise<any> {
    try {
      const customerId = req.params.id;
      const userId = req?.userId;
      const RequestData = req.body;

      const request = {
        ...RequestData,
        customer_id: customerId,
        // userId: userId,
      };

      const response = await this.saleservice.changeTagStatus(request);

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

  async getEstimate(req: Request, res: Response):Promise<any>{
    try{
      const customerId = req.params.id;
      console.log('errr',customerId);
      const userId =req?.userId;

      const data = await this.saleservice.getEstimate(customerId)


      res.status(200).json(data)
    }
    catch(err:any){
      res.status(500).json(err)
    }
  }

  async submitEstimate(req: Request, res: Response): Promise<any> {
    try {
      const validatedData = ValidationsubmitEstimate.safeParse(req.body);
      const customerId = req.params.id;
      const RequestData = req.body;
      if (!validatedData.success) {
        res.status(400).json({ errors: validatedData.error.issues });
      }

      const request = {
        ...RequestData,
        customer_id: customerId,
        files: req.files,

        // userId: userId,
      };
      const response = await this.saleservice.submitEstimate(request);

      res.status(200).json(response);
    } catch (err: any) {
      res.status(500).json(err);
    }
  }
}
