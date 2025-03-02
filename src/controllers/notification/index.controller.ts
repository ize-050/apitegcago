import { Request, Response } from "express";
import {NotificationService}   from '../../services/notification/index.service';
export class NotificationController {

     private notificationService
    constructor( ){
      this.notificationService = new NotificationService();
    }

  async getNotification(req: Request, res: Response): Promise<any> {
    try{
        const userId =  req?.userId;
        const notification = await this.notificationService.getNotification(userId);

        res.status(200).json(notification);
    }
    catch(err:any){
        console.log('Error Notification',err)
        res.status(500).json(err)
    }

  }

  async updateNotification(req: Request, res: Response): Promise<any> {
    try{
        const id =  req.params.id;
        const notification = await this.notificationService.readNotification(id);

        res.status(200).json(notification);
    }
    catch(err:any){
        console.log('Error Notification',err)
        res.status(500).json(err)
    }

  }

  

  async ReadAllNotifications(req: Request, res: Response): Promise<any>{
    try{
        const userId =  req?.userId;
        const notification = await this.notificationService.readAllNotifications(userId);

        res.status(200).json(notification);
    }
    catch(err:any){
        console.log('Error Notification',err)
        res.status(500).json(err)
    }
  }
}


