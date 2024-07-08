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


  async getEstimate(customerId: string):Promise<any>{
    try{
      const data = await this.saleRepo.getEstimate(customerId);
      console.log('data',data)
      const response = {
        data: data
      }
        
      return response;

    }
    catch(err:any){
      throw err;
    }
  }

  async submitEstimate(RequestData: Partial<any>): Promise<any> {
    try {
      const d_purchase: RequestPurchase = {
        book_number: RequestData.book_number,
        customer_number: RequestData.customer_number,
        customer_id: RequestData.customer_id,
        d_route: RequestData.d_route,
        d_transport: RequestData.d_transport,
        d_term: RequestData.d_term,
        d_origin: RequestData.d_origin,
        d_destination: RequestData.d_destination,
        d_size_cabinet: RequestData.d_size_cabinet,
        d_weight: RequestData.d_weight,
        d_address_origin: RequestData.d_address_origin,
        d_address_destination: RequestData.d_address_destination,
        d_refund_tag: RequestData.d_refund_tag,
        d_truck: RequestData.d_truck,
        d_etc: RequestData.d_etc,
      };

      await this.prisma.$transaction(async (tx) => {
        try {
          const purchase = await this.saleRepo.submitEstimate(tx , d_purchase);

          if (purchase) {
            const d_product: RequestProduct = {
              d_purchase_id: purchase.id,
              d_product_name: RequestData.d_product_name,
            };

            const purchase_products = await this.saleRepo.submitEstimateProduct(tx,
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
              for (let file of RequestData.files) {
                const tempFilePath = file.path;
                const d_image: RequestProductImage = {
                  d_product_id: purchase_products.id,
                  d_purchase_id: purchase.id,
                  d_product_image_name: file.filename,
                  d_active: true,
                };
                const purchase_product_image =
                  await this.saleRepo.submitEstimateProductImage(tx,d_image);

                if (purchase_product_image) {
                  const newFilePath = path.join(uploadDir, file.filename);
                  console.log("new file path", newFilePath);
                  await fs.renameSync(tempFilePath, newFilePath);
                }
              }
            }
      
          }
        } catch (error) {
         throw error; 
        }
      });
      const response ={
         message :'บัันทึกข้อมูลสำเร็จ',
         statusCode :200,
      }
      return  response ;
    } catch (err: any) {
      console.log("errservice", err);
      throw err;
    }
  }
}

export default SaleService;
