import { Request, Response } from "express";
import { CSStatusService } from "../../services/cs_status/index.service";
export class CSStatusController {
  private csStatusService;
  constructor() {
    this.csStatusService = new CSStatusService();
  }

  async getDataCsStatus(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getDataCsStatus(id);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async getBookcabinet(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getBookcabinet(id);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async getContain(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getContain(id);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async getDocumentStatus(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getDocumentStatus(id);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async getDeparture(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getDeparture(id);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async getWaitRelease(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getWaitRelease(id);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async createBookcabinet(req: Request, res: Response): Promise<any> {
    try {
      const userId = req?.userId;
      const id = req.params.id;
      const data = {
        ...req.body,
        d_purchase_id: id,
        files: req.files,
      };

      const csStatusData = await this.csStatusService.createBookcabinet(data);

      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async createReceive(req: Request, res: Response): Promise<any> {
    try {
      const userId = req?.userId;
      const data = {
        ...req.body,
        files: req.files,
      };

      const csStatusData = await this.csStatusService.createReceive(data);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error createReceive", err);
      res.status(500).json(err);
    }
  }

  async getReceipt(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getReceipt(id);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async createContain(req: Request, res: Response): Promise<any> {
    try {
      const data = {
        ...req.body,
        files: req.files,
      };
      const csStatusData = await this.csStatusService.createContain(data);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }
  

  async createDocuments(req: Request, res: Response): Promise<any> {
    try{
        const RequestData = req.body
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        const request ={
            ...RequestData,
            files: files
        }
        console.log("request",request)
        const csStatusData = await this.csStatusService.createDocument(request)
        return res.status(200).json(csStatusData);
        
    }
    catch(err:any){
        console.log('Error Notification', err)
        res.status(500).json(err)
    }
  }

  async createDeparture(req: Request, res: Response): Promise<any> { //ยื่นคำร้องไฟล
    try {
      const data = {
        ...req.body,
        files: req.files,
      };
      const csStatusData = await this.csStatusService.createDeparture(data);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error createDeparture", err);
      res.status(500).json(err);
    }
  }

  async createWaitRelease(req: Request, res: Response): Promise<any> { //รอตรวจปล่อย
    try {

      const data = {
        ...req.body,
        files: req.files,
      };
      console.log("data",data)
      const csStatusData = await this.csStatusService.createWaitRelease(data);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error createWaitRelease", err);
      res.status(500).json(err);
    }
  }
}
