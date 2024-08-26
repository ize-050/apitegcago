import { PrismaClient, customer } from "@prisma/client";
import moment from "moment";

class CsStatusRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }


    async getDataCsStatus(id: string): Promise<any> {
        try {
            const cs_purchase = await this.prisma.cS_Purchase.findMany({
                where: {
                    d_purchase_id: id
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return cs_purchase;
        }
        catch (err: any) {
            console.log('Error getDataCsStatus', err)
            throw new Error(err);
        }
    }

    async getBookcabinet(id: string): Promise<any> {
        try {
            const book_cabinet = await this.prisma.bookcabinet.findFirst({
                where: {
                    cs_purchase_id: id
                },
                include: {
                    Bookcabinet_picture: true
                }
            });
            return book_cabinet;
        }
        catch (err: any) {
            console.log('Error getBookcabinet', err)
            throw new Error(err);
        }
    }

    async getReceipt(id: string): Promise<any> {
        try {
            const getReceipt = await this.prisma.receive.findFirst({
                where: {
                    cs_purchase_id: id
                },
                include: {
                    Receive_picture: true
                }
            });
            return getReceipt;
        }
        catch (err: any) {
            console.log('Error getReceipt', err)
            throw new Error(err);
        }
    }

    async getContain(id: string): Promise<any> {
        try {
            const getContain = await this.prisma.contain.findFirst({
                where: {
                    id: id
                },
                include: {
                    Contain_picture: true
                }
            });
            return getContain;
        }
        catch (err: any) {
            console.log('Error getContain', err)
            throw new Error(err);
        }
    }
   
    async createCsPurchase(tx: any, data: any): Promise<any> {
        try{
            const cs_purchase = await tx.cS_Purchase.create({
                data: data
            });
            return cs_purchase;
        }
        catch(err:any){
            console.log('Error Notification', err)
            throw new Error(err);
        }

    }

    async createBookcabinet(tx: any, data: any): Promise<any> {
        try{
            const book_cabinet = await tx.bookcabinet.create({
                data: data
            });
            return book_cabinet;
        }
        catch(err:any){
            throw new Error(err);
        }
    }

    

    async createBookcabinetPicture(tx: any, data: any): Promise<any> {
        try{
            const book_cabinet_picture = await tx.bookcabinet_picture.create({
                data: data
            });
            return book_cabinet_picture;
        }
        catch(err:any){
            throw new Error(err);
        }
    }


    async createReceive(tx: any, data: any): Promise<any> {
        try{
            const receive = await tx.receive.create({
                data: data
            });
            return receive;
        }
        catch(err:any){
            throw new Error(err);
        }
    }

    async createReceivePicture(tx: any, data: any): Promise<any> {
        try{
            const receive_picture = await tx.Receive_picture.create({
                data: data
            });
            return receive_picture;
        }
        catch(err:any){
            throw new Error(err);
        }
    }


}

export default CsStatusRepository;
