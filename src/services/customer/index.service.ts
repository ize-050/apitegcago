import { Request, Response } from "express";
import CustomerRepository from "../../repository/customer/index.repository";


import { PrismaClient } from "@prisma/client";

import moment from 'moment'

class CustomerService {
  private customerRepo: CustomerRepository;
  private prisma: PrismaClient;

  constructor() {
    this.customerRepo = new CustomerRepository();
    this.prisma = new PrismaClient();
  }
  async getSelectCustomer(): Promise<any> {
    const data = await this.customerRepo.getSelectCustomer();
    return data;
  }

  async getCustomerDetail(customerId: string): Promise<any> {
    try {
        const customer =   this.customerRepo.getSelectCustomer()

        return customer;
    }
    catch(err:any){
        throw new Error(err)
    }
  }

  async getCustomerGroup(): Promise<any> {
    try{
      const customerGroup = await this.customerRepo.getCustomerGroup()
      return customerGroup
    }
    catch(err:any){
      throw new Error(err)
    }
  }
}



export default CustomerService;
