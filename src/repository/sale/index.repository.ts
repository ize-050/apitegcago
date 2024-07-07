import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';


class SaleRepository {

  private prisma: PrismaClient

  constructor() {
    this.prisma =  new PrismaClient()
  }



  async getCustomer(): Promise<any> {
    try{
        return  await this.prisma.customer.findMany({ //ดึงข้อมูลลูกค้า รอ Login
            skip:1-1,
            take:10,
            include:{
                details:true,
            }
        })
    }
    catch(err:any){
       throw new Error(err);
    }
  }
}

export default SaleRepository;
