import { customer } from "@prisma/client";
import { prisma } from "../../prisma/prisma-client";
import moment from "moment";

class NotificationRepository {

    constructor() {
    // ใช้ prisma singleton แทนการสร้าง PrismaClient ใหม่
  }

    async getDataAgency(page: number): Promise<any> { //ดึงข้อมูล  Agency
        try {
            console.log("page", page)
            const data = await prisma.agentcy.findMany({
                skip: (page - 1) * 10,
                take: 10,
                orderBy: {
                    id: 'asc',
                },
                where:{
                    deletedAt:null
                }
            });

            const TotalPage = await prisma.agentcy.count();
            return {
                data: data,
                TotalPage: TotalPage
            };
        } catch (err: any) {
            throw new Error(err);
        }
    }

    async createAgency(data: any): Promise<any> { //สร้าง Agency
        try {
            const Total = await prisma.agentcy.create({
                data: {
                    ...data
                },
            });
            return Total;
        } catch (err: any) {
            console.log("errCreate", err)
            throw new Error(err);
        }
    }

    async updateAgency(data: any, id: string): Promise<any> {
        try {
            const Total = await prisma.agentcy.update({
                where: {
                    id: id
                },
                data: {
                    ...data
                }
            });
            return Total;
        }
        catch (err: any) {
            console.log("errEdit", err)
            throw new Error(err);
        }
    }

    async deleteAgency(id: string): Promise<any> {
        try {
            const Total = await prisma.agentcy.update({
                where: {
                    id: id
                },
                data: {
                    deletedAt: new Date()
                }
            });
            return Total;
        }
        catch (err: any) {
            console.log("errDelete", err)
            throw new Error(err);
        }
    }

    async getCurrentData(page: number): Promise<any> {
        try {
            const data = await prisma.currency.findMany({
                skip: (page - 1) * 10,
                take: 10,
                orderBy: {
                    id: 'asc',
                },
                where:{
                    deletedAt:null
                }
            });
            const TotalPage = await prisma.currency.count();
            return {
                data: data,
                TotalPage: TotalPage
            };
        } catch (err: any) {
            throw new Error(err);
        }
    }

    async createCurrent(data: any): Promise<any> {
        try {
            const Total = await prisma.currency.create({
                data: {
                    ...data
                },
            });
            return Total;
        } catch (err: any) {
            console.log("errCreate", err)
            throw new Error(err);
        }
    }

    async updateCurrent(data: any, id: string): Promise<any> {
        try {
            const Total = await prisma.currency.update({
                where: {
                    id: id
                },
                data: {
                    ...data
                }
            });
            return Total;
        }
        catch (err: any) {
            console.log("errEdit", err)
            throw new Error(err);
        }
    }
    async deleteCurrent(id: string): Promise<any> {
        try {
            const Total = await prisma.currency.update({
                where: {
                    id: id
                },
                data: {
                    deletedAt: new Date()
                }
            });
            return Total;
        }
        catch (err: any) {
            console.log("errDelete", err)
            throw new Error(err);
        }
    }

    async getDocumentData(page: number): Promise<any> {
        try {
            const data = await prisma.document.findMany({
                skip: (page - 1) * 10,
                take: 10,
                orderBy: {
                    id: 'asc',
                },
                where:{
                    deletedAt:null
                }
            });
            const TotalPage = await prisma.document.count();
            return {
                data: data,
                TotalPage: TotalPage
            };
        } catch (err: any) {
            throw new Error(err);
        }
    }



}

export default NotificationRepository;
