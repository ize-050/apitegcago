import { customer } from "@prisma/client";
import { prisma } from "../../prisma/prisma-client";
import moment from "moment";

class NotificationRepository {
    

    constructor() {
    // ใช้ prisma singleton แทนการสร้าง PrismaClient ใหม่
  }

    async getNotification(id: string): Promise<any> { //ดึงข้อมูล Notification by Userid
        try {
            const data = await prisma.notification.findMany({
                where: {
                    user_id: id,
                    status: false,
                },
                orderBy:{
                    createdAt: 'desc'
                },
            });

            return data;
        } catch (err: any) {
            throw new Error(err);
        }
    }



    async sendNotification(Request: Partial<any>): Promise<any> {  //ส่งNotification ให้ทุกคน
        try {
            const Total = await prisma.notification.create({
                data: {
                    title: Request.title,
                    message: Request.message,
                    subject_key: Request.subject_key,
                    data: Request.data,
                    user_id: Request.user_id,
                    status: Request.status,
                    link_to: Request.link_to,
                },
            });

            return Total;
        } catch (err: any) {
            throw new Error(err);
        }
    }

    async readNotification(id: string): Promise<any> { //อ่าน Notification
        try {
            const Total = await prisma.notification.update({
                where: {
                    id: id,
                },
                data: {
                    status: true,
                },
            });

            return Total;
        } catch (err: any) {
            throw new Error(err);
        }
    }

    async readAllNotifications(userId:string): Promise<any> { //อ่านทุก Notification
        try {
            const Total = await prisma.notification.updateMany({
                where: {
                    user_id: userId,
                },
                data: {
                    status: true
                }
            });

            return Total;
        }
        catch (err: any) {
            throw new Error(err);
        }
    }
}

export default NotificationRepository;
