import { Request, Response } from "express";
import SaleRepository from "../../repository/sale/index.repository";



class SaleService {
    
    private saleRepo : SaleRepository
    constructor(){
       this.saleRepo = new  SaleRepository();
    }
  async getCustomer(): Promise<any> {
     const data =  await this.saleRepo.getCustomer();
    
    
     return data
  }
}

export default SaleService;
