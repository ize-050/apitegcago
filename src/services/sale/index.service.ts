import { Request, Response } from "express";
import SaleRepository from "../../repository/sale/index.repository";
import path from "path";
import fs from "fs";
import {
  RequestPurchase,
  RequestProductImage,
  RequestProduct,
  Tagstatus,
} from "../../interface/sale.interface";
import { PrismaClient } from "@prisma/client";

import moment from 'moment'

class SaleService {
  private saleRepo: SaleRepository;
  private prisma: PrismaClient;

  constructor() {
    this.saleRepo = new SaleRepository();
    this.prisma = new PrismaClient();
  }
  async getCustomer(RequestData: Partial<any>): Promise<any> {
    const data = await this.saleRepo.getCustomer(RequestData);
    return data;
  }

  async getCustomerDetail(customerId: string): Promise<any> {
    try {
      const data = await this.saleRepo.getCustomerDetail(customerId);

      let customer_detail: Partial<any> = {};

      customer_detail = data.details;
      delete data.details;
      switch (data.customer_status[0].cus_status) {
        case "สนใจ":
          data.customer_status[0].color = "bg-blue-500";
          break;
        case "ไม่สนใจ":
          data.customer_status[0].color = "bg-red-400";
          break;
        case "ติดตามต่อ":
          data.customer_status[0].color = "bg-orange-300";
          break;
        case "ติดต่อไม่ได้":
          data.customer_status[0].color = "bg-gray-500";
          break;
        case "ปิดการขาย":
          data.customer_status[0].color = "bg-green-400";
          break;
        default:
          data.customer_status[0].color = "bg-blue-500";
      }

      switch (data.cus_etc) {
        case "โทร":
          data.cus_etc_color = "bg-green-400";
          break;
        case "ทัก":
          data.cus_etc_color = "bg-blue-500";
          break;
        case "Walk-in":
          data.cus_etc_color = "bg-gray-300";
          break;
        case "ออกบูธ":
          data.cus_etc_color = "bg-purple-300";
          break;
        default:
          data.cus_etc_color = "bg-blue-500";
      }



      Object.assign(customer_detail, { cus_etc_color: data.cus_etc_color });
      Object.assign(customer_detail, {
        cus_status: data.customer_status[0].cus_status,
      });
      Object.assign(customer_detail, { color: data.customer_status[0].color });
      delete data.customer_status;
      Object.assign(customer_detail, data);

      return customer_detail;
    } catch (err: any) {
      throw err;
    }
  }

  async createCustomer(RequestData: Partial<any>): Promise<any> {
    try {
      const response = await this.saleRepo.createCustomer(RequestData);
      return response;
    } catch (err: any) {
      throw err;
    }
  }

  async editCustomer(RequestData: Partial<any>): Promise<any> {
    try {
      const response = await this.saleRepo.editCustomer(RequestData);
      return response;
    } catch (err: any) {
      throw err;
    }
  }

  async changeTagStatus(RequestData: Partial<any>): Promise<any> {
    try {
      const statusString: Tagstatus = RequestData.status;
      let status: Tagstatus | undefined;

      if (Object.values(Tagstatus).includes(statusString)) {
        status = statusString as Tagstatus;
      } else {
        return {
          message: "Invalid status value",
        };
      }
      const response = await this.saleRepo.changeTagStatus(RequestData);
      return response;
    } catch (err: any) {
      throw err;
    }
  }

  async getAllEstimate(RequestData:any):Promise<any>{
    try{
      const PurchaseData = await this.saleRepo.getAllEstimate(RequestData);
      return PurchaseData

    }
    catch(err:any){
      throw err;
    }
  }

  async getEstimate(purchaseId: string): Promise<any> {
    try {
      const data = await this.saleRepo.getEstimate(purchaseId);
      let response : Partial<any> = {};
      if(data ==null){
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
      }
      else{
        response = data;
      }

      

      return response;
    } catch (err: any) {
      throw err;
    }
  }


  async cancelEstimate(RequestData: Partial<any>): Promise<any> {
    try {
      const response = await this.saleRepo.cancelEstimate(RequestData);
      return response;
    } catch (err: any) {
      throw err;
    }
  }

  async getCheckBooking():Promise<any>{ //เช็ค Booking +1 ถ้าไม่ให้เริ่มใหม่ต่อวัน
    try{
        const today = moment().format('YYYY-MM-DD');
        let response : Partial<any> ={}
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

        return response;
    }
    catch(err:any){
      throw new Error(err)
    }
  }
  async submitEstimate(RequestData: Partial<any>): Promise<any> {
    try {
      const d_purchase: RequestPurchase = {

        book_number: RequestData.book_number,
        customer_id: RequestData.customer_id,
        d_route: RequestData.d_route,
        d_transport: RequestData.d_transport,
        d_group_work: RequestData.d_group_work,
        d_term: RequestData.d_term,
        d_origin: RequestData.d_origin,
        d_address_destination_la: RequestData.d_address_destination_la,
        d_address_destination_long: RequestData.d_address_destination_long,
        d_address_origin_la: RequestData.d_address_origin_la,
        d_address_origin_long: RequestData.d_address_origin_long,
        d_destination: RequestData.d_destination,
        d_size_cabinet: RequestData.d_size_cabinet,
        d_weight: RequestData.d_weight,
        d_address_origin: RequestData.d_address_origin,
        d_address_destination: RequestData.d_address_destination,
        d_refund_tag: RequestData.d_refund_tag,
        d_truck: RequestData.d_truck,
        d_etc: RequestData.d_etc,
        d_status:"Sale ตีราคา",
      };

      await this.prisma.$transaction(async (tx) => {
        try {
          const purchase = await this.saleRepo.submitEstimate(tx, d_purchase);

          if (purchase) {
            const d_product: RequestProduct = {
              d_purchase_id: purchase.id,
              d_product_name: RequestData.d_product,
            };

            const purchase_products = await this.saleRepo.submitEstimateProduct(
              tx,
              d_product
            );

            const uploadDir = path.join(
              "public",
              "images",
              "purchase_product",
              `${purchase.id}`
            );
            // Create directories if they don't exist
            await fs.mkdirSync(uploadDir, { recursive: true });

            if (purchase_products) {
              if( RequestData.files.length > 0){
              for (let file of RequestData.files) {
                const tempFilePath = file.path;
                const d_image: RequestProductImage = {
                  d_product_id: purchase_products.id,
                  d_purchase_id: purchase.id,
                  d_product_image_name: file.filename,
                  d_active: true,
                };
                const purchase_product_image =
                  await this.saleRepo.submitEstimateProductImage(tx, d_image);

                if (purchase_product_image) {
                  const newFilePath = path.join(uploadDir, file.filename);
                  console.log("new file path", newFilePath);
                  await fs.renameSync(tempFilePath, newFilePath);
                }
              }

             await this.saleRepo.ChangeStatus(tx,purchase.id);
             await this.saleRepo.submitPurchaseemployee( tx, purchase.id,  RequestData.employee_id)

            }
            }
          }
        } catch (error) {
          throw error;
        }
      });

      const response = {
        message: "บัันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("errservice", err);
      throw err;
    }
  }
}

export default SaleService;
