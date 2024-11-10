import { PrismaClient, customer } from "@prisma/client";
import moment from "moment";

class NotificationRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getNotification(id: string): Promise<any> { //ดึงข้อมูล Notification by Userid
        try {
            const data = await this.prisma.notification.findMany({
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
            const Total = await this.prisma.notification.create({
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
            const Total = await this.prisma.notification.update({
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
            const Total = await this.prisma.notification.updateMany({
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
