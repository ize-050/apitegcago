import { Request, Response } from "express";
import { CSStatusService } from '../../services/cs_status/index.service';
export class CSStatusController {

    private csStatusService
    constructor() {
        this.csStatusService = new CSStatusService();
    }



async getDataCsStatus(req: Request, res: Response): Promise<any> {
    try{
        const id = req.params.id;
        const csStatusData = await this.csStatusService.getDataCsStatus(id);
        return res.status(200).json(csStatusData);
    }
    catch(err:any){
        console.log('Error Notification', err)
        res.status(500).json(err)
    }
 }


 async getBookcabinet(req: Request, res: Response): Promise<any> {
    try{
        const id = req.params.id;
        const csStatusData = await this.csStatusService.getBookcabinet(id);
        return res.status(200).json(csStatusData);
    }
    catch(err:any){
        console.log('Error Notification', err)
        res.status(500).json(err)
    }
 }

 async getContain(req: Request, res: Response): Promise<any> {
    try{
        const id = req.params.id;
        const csStatusData = await this.csStatusService.getContain(id);
        return res.status(200).json(csStatusData);
    }
    catch(err:any){
        console.log('Error Notification', err)
        res.status(500).json(err)
    }
 }

 async createBookcabinet(req: Request, res: Response): Promise<any> {
    try{
        const userId = req?.userId;
        const id = req.params.id;
        const data = {
            ...req.body,
            d_purchase_id :id,
            files : req.files
        }

        const csStatusData = await this.csStatusService.createBookcabinet(data);


        return res.status(200).json(csStatusData);
    }
    catch(err:any){
        console.log('Error Notification', err)
        res.status(500).json(err)
    }
 }

 async createReceive(req: Request, res: Response): Promise<any> {
    try{
        const userId = req?.userId;
        const data = {
            ...req.body,
            files : req.files
        }

        const csStatusData = await this.csStatusService.createReceive(data);
        return res.status(200).json(csStatusData);
    }
    catch(err:any){
        console.log('Error createReceive', err)
        res.status(500).json(err)
    }
 }  



 async getReceipt(req: Request, res: Response): Promise<any> {
    try{
        const id = req.params.id;
        const csStatusData = await this.csStatusService.getReceipt(id);
        return res.status(200).json(csStatusData);
    }
    catch(err:any){
        console.log('Error Notification', err)
        res.status(500).json(err)
    }
 }

}


