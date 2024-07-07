import { Request, Response } from "express";
import SaleService from "../../services/sale/index.service";
export class SaleController {

     private saleservice
    constructor( ){
      this.saleservice = new SaleService();
    }

  async getCustomer(req: Request, res: Response): Promise<any> {
    try{
         const data = await this.saleservice.getCustomer()
        res.json({
            data: data,
          });
    }
    catch(err:any){
        res.status(500).json(err)
    }
    
  }
}


