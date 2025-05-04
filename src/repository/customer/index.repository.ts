
import { customer } from "@prisma/client";
import { prisma } from "../../prisma/prisma-client";

class CustomerRepository {
  constructor() {
    // ใช้ prisma singleton แทนการสร้าง PrismaClient ใหม่
  }

  async getSelectCustomer(): Promise<any> {
    try {

      const customer = await prisma.customer.findMany();

      return customer

    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getCustomerGroup() :Promise<any>{
    try{
       return await prisma.customer_group.findMany()
    }
    catch(err:any){
      throw new Error(err);
    }
  }


}


export default CustomerRepository;
