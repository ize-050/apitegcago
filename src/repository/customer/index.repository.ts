
import { PrismaClient ,customer } from "@prisma/client";




class CustomerRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getSelectCustomer(): Promise<any> {
    try {

      const customer = await this.prisma.customer.findMany();

      return customer

    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getCustomerGroup() :Promise<any>{
    try{
       return await this.prisma.customer_group.findMany()
    }
    catch(err:any){
      throw new Error(err);
    }
  }


}


export default CustomerRepository;
