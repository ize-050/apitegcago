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
        status,
        tag,
        skip,
        userId: userId,
      };
      const data = await this.saleservice.getCustomer(RequestData);
      let customers: any[] = [];
      for (let customer of data.customer) {
        switch (customer.cus_etc) {
          case "โทร":
            customer.color = "bg-green-400";
            break;
          case "ทัก":
            customer.color = "bg-blue-500";
            break;
          case "Walk-in":
            customer.color = "bg-gray-300";
            break;
          case "ออกบูธ":
            customer.color = "bg-purple-500";
            break;
          default:
            customer.color = "bg-blue-500";
        }
        for (let customer_status of customer.customer_status) {
          switch (customer_status.cus_status) {
            case "สนใจ":
              customer_status.color = "bg-blue-500";
              break;
            case "ไม่สนใจ":
              customer_status.color = "bg-red-400";
              break;
            case "ติดตามต่อ":
              customer_status.color = "bg-orange-300";
              break;
            case "ติดต่อไม่ได้":
              customer_status.color = "bg-gray-300";
              break;
            case "ปิดการขาย":
              customer_status.color = "bg-green-400";
              break;
            default:
              customer_status.color = "bg-blue-500";
          }
        }

        for (let d_status of customer.d_status) {
          console.log('d_status.status_name',d_status.status_name);
          switch (d_status.status_name) {
          
            case "กำลังดูแล":
              d_status.color = "bg-purple-500";
              break;
            case "รอตีราคา":
              d_status.color = "bg-blue-300";
              break;
            case "อยู่ระหว่างดำเนินการ":
              d_status.color = 'bg-orange-300';
              break;
          }

        }
        customers.push(customer);
      }
      let customerData = {
        customer: customers,
        total: data.total,
      };
      res.json({
        data: {
          users: customerData,
          message: "success",
          statusCode: 200,
        },
      });
    } catch (err: any) {
      console.log("errr", err);
      res.status(500).json(err);
    }
  }

  async getCustomerDetail(req: Request, res: Response): Promise<any> {
    try {
      let customerId = req.params.id;
      const response = await this.saleservice.getCustomerDetail(customerId);

      const resResponse = {
        customer_detail: response,
        statusCode: 200,
        message: "ดึงข้อมูลสำเร็จ",
      };
      res.status(200).json(resResponse);
    } catch (err: any) {
      res.status(500).json(err);
    }
  }

  async createCustomer(req: Request, res: Response): Promise<any> {
    try {
      console.log("reqqq", req.body);
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
      console.log("delay");
      const customerId = req.params.id;
      const userId = req?.userId;
      const RequestData = req.body;

      const request = {
        ...RequestData,
        customer_id: customerId,
        // userId: userId,
      };

      const response = await this.saleservice.changeTagStatus(request);
      console.log("response", response);
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

  async getEstimate(req: Request, res: Response): Promise<any> {
    try {
      const customerId = req.params.id;
      console.log("errr", customerId);
      const userId = req?.userId;

      const data = await this.saleservice.getEstimate(customerId);

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
      // const response ={
      //   message:'เพิ่มข้อมูลสำเร็จ',
      //   statusCode:201

      // }
      res.status(200).json(response);
    } catch (err: any) {
      res.status(500).json(err);
    }
  }
}
