import { Request, Response } from "express";
import SuperadminService from "../../services/superadmin/index.service";


export class SuperadminController {
  private superadminservice;

  constructor() {
    this.superadminservice = new SuperadminService();
  }

  async getEmployee(req: Request, res: Response): Promise<any> {
    console.log("ddd")
    try {
        const role_name = req.query.role_name as string; 

      

      const page = parseInt(req.query.page as string) || 1;

      const perPage = 10;
      const skip = (page - 1) * perPage;

      const RequestData = {
        ...req.query,
        skip,
        role_name: role_name,
      };
      const data = await this.superadminservice.getEmployee(RequestData);

      let customerData = {
        data: data.data,
        total: data.total,
      };
      res.json({
          data: customerData,
          message: "success",
          statusCode: 200,     
      });
    } catch (err: any) {
      console.log("errr", err);
      res.status(500).json(err);
    }
  }
}

