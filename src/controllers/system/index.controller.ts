import { Request, Response } from "express";
import { SystemService } from '../../services/system/index.service';
export class SystemController {

    private systemService
    constructor() {
        this.systemService = new SystemService();
    }

    async getAgencyData(req: Request, res: Response): Promise<any> {
        try {
            const userId = req?.userId;

            const page = req.query.page ? parseInt(req.query.page as string) : 1;


            const agencyData = await this.systemService.getDataAgency(page);


            res.status(200).json(agencyData);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }

    }

    async createAgency(req: Request, res: Response): Promise<any> {
        try {
            const userId = req?.userId;
            const data = req.body;

            const agencyData = await this.systemService.createAgency(data);
            return res.status(200).json(agencyData);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    async updateAgency(req: Request, res: Response): Promise<any> {
        try {
            const userId = req?.userId;
            const id = req.params.id;
            const data = req.body;

            const agencyData = await this.systemService.updateAgency(data, id);
            return res.status(200).json(agencyData);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }

    }

    async deleteAgency(req: Request, res: Response): Promise<any> {
        try {
            const userId = req?.userId;
            const id = req.params.id;
            const data = req.body;

            const agencyData = await this.systemService.deleteAgency(id);
            return res.status(200).json(agencyData);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    async getCurrent(req: Request, res: Response): Promise<any> {
        try {
            const userId = req?.userId;
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const currentData = await this.systemService.getCurrentData(page);

            return res.status(200).json(currentData);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    async createCurrent(req: Request, res: Response): Promise<any> {
        try {
            const userId = req?.userId;
            const data = req.body;
            const currentData = await this.systemService.createCurrent(data);
            return res.status(200).json(currentData);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    async updateCurrent(req: Request, res: Response): Promise<any> {
        try {
            const userId = req?.userId;
            const id = req.params.id;
            const data = req.body;

            const currentData = await this.systemService.updateCurrent(data, id);
            return res.status(200).json(currentData);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }

    }

    async deleteCurrent(req: Request, res: Response): Promise<any> {
        try {
            const userId = req?.userId;
            const id = req.params.id;
            const data = req.body;

            const currentData = await this.systemService.deleteCurrent(id);
            return res.status(200).json(currentData);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    async getDocumentData(req: Request, res: Response): Promise<any>{
        try {
            const userId = req?.userId;
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const documentData = await this.systemService.getDocumentData(page);

            return res.status(200).json(documentData);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }
}


