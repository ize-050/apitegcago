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

  async getLeave(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getLeave(id);
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

  async getSuccessRelease(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getSuccessRelease(id);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }


  async getDestination(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getDestination(id);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async getSentSuccess(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getSentSuccess(id);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async getReturn(req: Request, res: Response): Promise<any> {
    try{
      const id = req.params.id;
      const csStatusData = await this.csStatusService.getReturn(id);
      return res.status(200).json(csStatusData);
    }
    catch(err:any){
      console.log("Error Notification",err)
      res.status(500).json(err)
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
      console.log("csStatusData", csStatusData);

    
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async updateBookcabinet(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const data = {
        ...req.body,
        id: id,
        files: req.files,
      };
      const csStatusData = await this.csStatusService.updateBookcabinet(data);

      const response ={
        statusCode : 200,
        message : "success",
        id : id,
      }
      return res.status(200).json(response);
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

  async updateReceive(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id;
      const data = {
        ...req.body,
        id: id,
        files: req.files,
      };

      const response = {
        statusCode : 200,
        message : "success",
        id : id,
      }
      const csStatusData = await this.csStatusService.updateReceive(data);
      return res.status(200).json(response);
    } catch (err: any) {
      console.log("Error Notification", err);
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

  async editContain(req: Request, res: Response): Promise<any> {
    try{
        const data = {
            ...req.body,
            id:req.params.id,
            files: req.files,
        }
        const csStatusData = await this.csStatusService.editContain(data)
        return res.status(200).json(csStatusData);
    }
    catch (err: any) {
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

  async editDocumentStatus(req: Request, res: Response): Promise<any> {
    try{
      const RequestData = req.body
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };


      const request ={
        ...RequestData,
        id: req.params.id,
        files: files
    }
    console.log("request",request)
    const csStatusData = await this.csStatusService.editDocument(request)
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

  async updateDeparture(req: Request, res: Response): Promise<any> {
    try {
      const data = {
        ...req.body,
        id: req.params.id,
      };
      const csStatusData = await this.csStatusService.updateDeparture(data);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error updateDeparture", err);
      res.status(500).json(err);
    }
  }

   async createLeave(req: Request, res: Response): Promise<any> { //ยื่นคำร้องไฟล
    try {
      const data = {
        ...req.body,
        files: req.files,
      };
      const csStatusData = await this.csStatusService.createLeave(data);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error createLeave", err);
      res.status(500).json(err);
    }
 }

    async editLeave(req:Request,res:Response):Promise<any>{
      try{
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const RequestData = req.body

        const request ={
          ...RequestData,
          id: req.params.id,
          files: files
        }

        console.log("request",request)
        const csStatusData = await this.csStatusService.editLeave(request)
        return res.status(200).json(csStatusData);
      }
      catch(err:any){
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


  async editWaitRelease(req: Request, res: Response): Promise<any> {
    try{
      console.log("req.files,",req.files,)
      const data = {
        ...req.body,
        id: req.params.id,
        files: req.files,
      };
      const csStatusData = await this.csStatusService.editWaitRelease(data)
      return res.status(200).json(csStatusData);
    }
    catch(err:any){
      console.log("Error editWaitRelease",err)
      res.status(500).json(err)
    }
  }

  async createSuccessRelease(req: Request, res: Response): Promise<any> { //ปล่อยเรียบร้อย
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const data = {
        ...req.body,
        files: files,
      };
      const csStatusData = await this.csStatusService.createSuccessRelease(data);
      return res.status(200).json(csStatusData);
    } catch (err: any) {
      console.log("Error createSuccessRelease", err);
      res.status(500).json(err);
    }
  }

  async updateSuccessRelease(req: Request, res: Response): Promise<any> {
    try {
      const data = {
        ...req.body,
        id: req.params.id,
        files: req.files,
      };
      const csStatusData = await this.csStatusService.updateSuccessRelease(data);
      return res.status(200).json(csStatusData);
    }
    catch(err:any){
      console.log("Error updateSuccessRelease",err)
      res.status(500).json(err)
    }
  } 

  async createDestination(req: Request, res: Response): Promise<any> { //ปล่อยเรียบร้อย
    try {
        const data = {
          ...req.body,
          files: req.files,
        };
        console.log("data",data)
        const csStatusData = await this.csStatusService.createDestination(data);
        return res.status(200).json(csStatusData);
      } catch (err: any) {
        console.log("Error createWaitRelease", err);
        res.status(500).json(err);
      }
  }

  async updateDestination(req: Request, res: Response): Promise<any> {
    try {
      const data = {
        ...req.body,
        id: req.params.id,
        files: req.files,
      };

      
      const csStatusData = await this.csStatusService.updateDestination(data);

      const response = {
        statusCode : 200,
        message : "success",
        id : data.id,
      }
      return res.status(200).json(response);
    } catch (err: any) {
      console.log("Error updateDestination", err);
      res.status(500).json(err);
    }
  }

  async createSentSuccess(req: Request, res: Response): Promise<any> { //ปล่อยเรียบร้อย
    try {
        const data = {
          ...req.body,
          files: req.files,
        };
        console.log("data",data)
        const csStatusData = await this.csStatusService.createSentSuccess(data);
        return res.status(200).json(csStatusData);
      } catch (err: any) {
        console.log("Error createWaitRelease", err);
        res.status(500).json(err);
      }

  }

  async updateSentSuccess(req: Request, res: Response): Promise<any> {
    try{
      const data = {
        ...req.body,
        id: req.params.id,
        files: req.files,
      };
      const csStatusData = await this.csStatusService.updateSentSuccess(data);
      const response = {
        statusCode : 200,
        message : "success",
        id : data.id,
      }
      return res.status(200).json(response);
    }
    catch(err:any){
      console.log("Error updateSentSuccess",err);
      res.status(500).json(err);
    }
  }

  async createReturn(req: Request, res: Response): Promise<any> { //ปล่อยเรียบร้อย
    try{
        const data = {
            ...req.body,
            files: req.files,
        }
        const csStatusData = await this.csStatusService.createReturn(data)
        return res.status(200).json(csStatusData)
    }
    catch(err:any){
      console.log("Error createWaitRelease",err);
      res.status(500).json(err);
    }

  }

  async editReturn(req: Request, res: Response): Promise<any> {
    try{
        const data = {
            ...req.body,
            id:req.params.id,
            files: req.files,
        }
        const csStatusData = await this.csStatusService.editReturn(data)
        return res.status(200).json(csStatusData);
    }
    catch (err: any) {
      console.log("Error Notification", err);
      res.status(500).json(err);
    }
  }

  async getEtc(req: Request, res: Response): Promise<any> {
    try{
      const id = req.params.id
      const csStatusData = await this.csStatusService.getEtc(id)
      return res.status(200).json(csStatusData)
    }
    catch(err:any){
      console.log("Error getEtc",err)
      res.status(500).json(err)
    }
  }

  async createEtc(req: Request, res: Response): Promise<any> {
    try{
      const data = {
        ...req.body,
        cs_purchase_id: req.params.id,
      }
      const csStatusData = await this.csStatusService.createEtc(data)
      return res.status(200).json(csStatusData)
    }
    catch(err:any){
      console.log("Error createEtc",err)
      res.status(500).json(err)
    }
  }
}
