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
import moment from "moment";

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



  async getAllEstimate(req: Request, res: Response): Promise<any> {
    try {

      const page = parseInt(req.query.page as string) || 1;

      const perPage = 10;
      const skip = (page - 1) * perPage;
      const status = req.query.status as string | undefined;
      const tag = req.query.tag as string | undefined;
      const userId = req?.userId
      const RequestData = {
        ...req.query,
        status,
        tag,
        skip,
        userId: userId,
      };
      const data = await this.saleservice.getAllEstimate(RequestData);
    
      let Purchase: any[] = []
      for (let purchase of data.purchase) {
        purchase.employee = data.employee
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

  async getEstimate(req: Request, res: Response): Promise<any> {
    try {
      const purchaseId = req.params.id;
      console.log("errr", purchaseId);
      const userId = req?.userId;


      const data = await this.saleservice.getEstimate(purchaseId);
      
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
      else if (data.d_status === 'Cs รับงาน') {
        data.color = 'bg-[#FFC8C8]'
      }
      else if (data.d_status === 'CS ร้องขอเอกสาร') {
        data.color = 'bg-red-400'
      }
      else if (data.d_status === 'Sale แนบเอกสาร') {
        data.color = 'bg-red-400'
      }
      else if (data.d_status === 'Cs เสนอราคา') {
        data.color = 'bg-red-400'
      }
      else if (data.d_status === 'ยกเลิกคำสั่งซื้อ') {
        data.color = 'bg-red-500'
      }
      else if (data.d_status === 'อยู่ระหว่างทำ Financial') {
        data.color = 'bg-[#946A00]'
      }
      else if (data.d_status === 'ค้างชำระเงิน') {
        data.color = 'bg-red-500'
      }
      else if (data.d_status === 'ปิดการขาย') {
        data.color = 'bg-green-500'
      }
      else if (data.d_status === 'ลูกค้าเครดิต') {
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

  async cancelEstimate(req: Request, res: Response): Promise<any> {
    try {
      const purchaseId = req.params.id;

      const userId = req?.userId;

      const RequestData = req.body;

      const request = {
        ...RequestData,
        purchase_id: purchaseId,
        userId: userId,
      };

      const response = await this.saleservice.cancelEstimate(request);

      res.status(200).json(response);
    }
    catch (err: any) {
      console.log('errCancelEstimate', err)
      res.status(500).json(err);
    }
  }


  async getCheckBooking(req: Request, res: Response): Promise<any> {
    try {
      const response = await this.saleservice.getCheckBooking();
      res.status(200).json(response);
    } catch (err: any) {
      res.status(500).json(err);
    }
  }


  async submitEstimate(req: Request, res: Response): Promise<any> { //บันทึกใบจองเปิดใหม่
    try {
      const validatedData = ValidationsubmitEstimate.safeParse(req.body);
      const customerId = req.params.id;

      const employee_id = req.userId
      const RequestData = req.body;
      if (!validatedData.success) {
        res.status(400).json({ errors: validatedData.error.issues });
      }

      const request = {
        ...RequestData,
        employee_id: employee_id,
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

  async applyEmployee(req: Request, res: Response): Promise<any> {
    try {
      const Requestdata ={
        id: req.params.id,
        employeeId: req.body.employeeId
      }
      const response = await this.saleservice.applyEmployee(Requestdata);
      res.status(200).json(response);
    } catch (err: any) {
      console.log('err', err)
      res.status(500).json(err);
    }
  }

  async acceptJob(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      let RequestData ={
        is_active: req.body.is_active,
        userId: req?.userId
      }
      console.log('RequestData', RequestData)
      const response = await this.saleservice.acceptJob(id, RequestData);
      res.status(200).json(response);
    } catch (err: any) {
      console.log('erraccept', err)
      res.status(500).json(err);
    }
  }


  async cancelJob(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const user_id = req?.userId;
      const response = await this.saleservice.cancelJob(id,user_id);
      res.status(200).json(response);
    } catch (err: any) {
      console.log('errcancel', err)
      res.status(500).json(err);
    }
  }

  async updateDocument(req: Request, res: Response): Promise<any> { //แก้ไขเอกสาร
    try {

      const formDataFields = req.body;
      const uploadedFiles: any = req.files;
      const purchaseId = req.params.id;
      const userId = req?.userId;

      const RequestData = {
        ...formDataFields,
        purchase_id: purchaseId,
        userId: userId,
        files: uploadedFiles,
      };

      const response = await this.saleservice.updateDocument(RequestData);

      res.status(200).json(true);
    }
    catch (err: any) {
      console.log('err', err)
      res.status(500).json(err)
    }
  }


  async updatePreEstimate(req: Request, res: Response): Promise<any> {
    try {
      const validatedData = ValidationsubmitEstimate.safeParse(req.body);
      const purchaseId = req.params.id;

      const employee_id = req.userId
      const RequestData = req.body;
      // if (!validatedData.success) {
      //   res.status(400).json({ errors: validatedData.error.issues });
      // }

      const request = {
        ...RequestData,
        employee_id: employee_id,
        purchase_id: purchaseId,
        files: req.files,

        // userId: userId,
      };

      const response = await this.saleservice.updateEstimate(request);
      res.status(200).json(response);
    } catch (err: any) {
      res.status(500).json(err);
    }
  }


  async submitAddorderPurchase(req: Request, res: Response): Promise<any> {
    try {

      const RequestData = req.body
      const userId = req?.userId;
      const request = {
        ...RequestData,
        userId: userId,
        files: req.files,
      };

      const response = await this.saleservice.submitAddorderPurchase(request);


      res.status(200).json({
        data: {
          message: "บันทึกข้อมูลสำเร็จ",
          statusCode: 200,
        },
      });
    }
    catch (err: any) {
      console.log("errdata", err)
      res.status(500).json(err)
    }
  }

  async updatestatusPurchase(req: Request, res: Response): Promise<any> {
    try {
      const purchaseId = req.params.id;
      const request = {
        purchase_id: purchaseId,
      };
      const response = await this.saleservice.updatestatusPurchase(request);
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

  async submitpayment(req: Request, res: Response): Promise<any> {
    try {

      const RequestData = req.body
      const userId = req?.userId;


      const purchaseEtcFiles = (req.files as any[]).filter(file => file.fieldname === 'purchase_etc');
      const conditionFiles = (req.files as any[]).filter(file => file.fieldname === 'condition');
      const purchaseFiles = (req.files as any[]).filter(file => file.fieldname === 'purchase_file');
      const type_image = (req.files as any[]).filter(file => file.fieldname === 'type_images');


      

      const request = {
        ...RequestData,
        userId: userId,
        purchaseEtcFiles: purchaseEtcFiles,
        conditionFiles: conditionFiles,
        purchaseFiles: purchaseFiles,
        typeImage: type_image,

      };  

      console.log("request", request)


      const response = await this.saleservice.submitpayment(request);

      
      res.status(200).json({
        data: {
          message: "บันทึกข้อมูลสำเร็จ",
          statusCode: 200,
        },
      });
    }
    catch (err: any) {
      console.log("erererererer", err)
      res.status(500).json(err)
    }

  }
}
