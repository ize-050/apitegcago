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
                    number_key: 'desc',
                }
            });
            return cs_purchase;
        }
        catch (err: any) {
            console.log('Error getDataCsStatus', err)
            throw new Error(err);
        }
    }

    async getDocumentStatus(id: string): Promise<any> {
        try {
            const document = await this.prisma.cs_document.findFirst({
                where: {
                    cs_purchase_id: id
                },
                include: {
                    Cs_document_file: true
                }
            });
            return document;
        }
        catch (err: any) {
            console.log('Error getDocumentStatus', err)
            throw new Error(err);
        }
    }

    async getDeparture(id: string): Promise<any> {
        try {
            const departure = await this.prisma.proveDeparture.findFirst({
                where: {
                    cs_purchase_id: id
                },
            });
            return departure;
        }
        catch (err: any) {
            console.log('Error getDeparture', err)
            throw new Error(err);
        }
    }

    async getWaitRelease(id: string): Promise<any> {
        try {
            const wait_release = await this.prisma.waitrelease.findFirst({
                where: {
                    cs_purchase_id: id
                },
                include: {
                    waitrelease_file: true
                }
            });
            return wait_release;
        }
        catch (err: any) {
            console.log('Error getWaitRelease', err)
            throw new Error(err);
        }
    }

    async create(tx: any, data: any,key:string): Promise<any> { //create
        try{
            const id = await tx[key].create({
                data: data
            });
            return id;
        }
        catch(err:any){
            console.log("error",err)
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
                    cs_purchase_id: id
                },
                include: {
                    Contain_product: true,
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

    async createContainProduct(tx: any, data: any,id:string): Promise<any> { //createProduct
        try{
            const contain = await tx.Contain_product.createMany({
                data: data.map((item:any) => {
                    return {
                        ...item,
                        contain_id: id
                    }
                })
            });
            return contain;
        }
        catch(err:any){
            throw new Error(err);
        }
    }

    async createContainPicture(tx: any, data: any): Promise<any> {
        try{
            const contain_picture = await tx.Contain_picture.create({
                data: data
            });
            return contain_picture;
        }
        catch(err:any){
            throw new Error(err);
        }
    }

    async createDocument(tx: any, data: any,key:string): Promise<any> { //create
        try{
            const id = await tx[key].create({
                data: data
            });
            return id;
        }
        catch(err:any){
            console.log("errorcreateDocument",err)
            throw new Error(err);
        }
    }


}

export default CsStatusRepository;
