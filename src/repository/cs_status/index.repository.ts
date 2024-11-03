import { PrismaClient  } from "@prisma/client";
import moment from "moment";
import { CSStatusService } from '../../services/cs_status/index.service';

class CsStatusRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getDataCsStatus(id: string): Promise<any> {
    try {
      const cs_purchase = await this.prisma.cs_purchase.findMany({
        where: {
          d_purchase_id: id,
        },
        orderBy: {
          number_key: "desc",
        },
      });
      return cs_purchase;
    } catch (err: any) {
      console.log("Error getDataCsStatus", err);
      throw new Error(err);
    }
  }

  async getDocumentStatus(id: string): Promise<any> {
    try {
      const document = await this.prisma.cs_document.findFirst({
        where: {
          cs_purchase_id: id,
        },
        include: {
          cs_document_file: true,
        },
      });
      return document;
    } catch (err: any) {
      console.log("Error getDocumentStatus", err);
      throw new Error(err);
    }
  }

  async getDeparture(id: string): Promise<any> {
    try {
      const departure = await this.prisma.provedeparture.findFirst({
        where: {
          cs_purchase_id: id,
        },
      });
      return departure;
    } catch (err: any) {
      console.log("Error getDeparture", err);
      throw new Error(err);
    }
  }

  async getWaitRelease(id: string): Promise<any> {
    try {
      const wait_release = await this.prisma.waitrelease.findFirst({
        where: {
          cs_purchase_id: id,
        },
        include: {
          waitrelease_file: true,
        },
      });
      return wait_release;
    } catch (err: any) {
      console.log("Error getWaitRelease", err);
      throw new Error(err);
    }
  }

  async getSuccessRelease(id: string): Promise<any> {
    try {
      const success_release = await this.prisma.cs_inspection.findFirst({
        where: {
          cs_purchase_id: id,
        },
        include: {
          cs_inspection_file: true,
        },
      });
      return success_release;
    } catch (err: any) {
      console.log("Error getSuccessRelease", err);
      throw new Error(err);
    }
  }

  async getDestination(id: string): Promise<any> {
    try {
      const destination = await this.prisma.cs_wait_destination.findFirst({
        where: {
          cs_purchase_id: id,
        },
        include: {
          cs_wait_destination_file: true,
          waitrelease: true,
        },
      });
      return destination;
    } catch (err: any) {
      console.log("Error getDestination", err);
      throw new Error(err);
    }
  }

  async getLeave(id: string): Promise<any> {
    try {
      const leave = await this.prisma.leave.findFirst({
        where: {
          cs_purchase_id: id,
        },
        include: {
          leavefile: true,
        },
      });
      return leave;
    } catch (err: any) {
      console.log("Error getLeave", err);
      throw new Error(err);
    }
  }

  async getSentSuccess(id: string): Promise<any> {
    try {
      const sent_success = await this.prisma.cs_already_sent.findFirst({
        where: {
          cs_purchase_id: id,
        },
        include: {
          cs_already_sent_file: true,
        },
      });
      return sent_success;
    } catch (err: any) {
      console.log("Error getSentSuccess", err);
      throw new Error(err);
    }
  }

  async getReturn(id: string): Promise<any> {
    try {
      const getReturn = await this.prisma.cs_return_cabinet.findFirst({
        where: {
          cs_purchase_id: id,
        },
        include: {
          cs_return_cabinet_file: true,
        },
      });
      return getReturn;
    } catch (err: any) {
      console.log("Error getReturn", err);
      throw new Error(err);
    }
  }

  async create(tx: any, data: any, key: string): Promise<any> {
    //create
    try {
      
      const id = await tx[key].create({
        data: data,
      });
      return id;
    } catch (err: any) {
      console.log("error", err);
      throw new Error(err);
    }
  }

  

  async update(tx: any,id:string, data: any, key: string): Promise<any> {
    //update
    try {
      const update = await tx[key].update({
        where: {
          id: id,
        },
        data: data,
      });
      return update;
    } catch (err: any) {
      console.log("error", err);
      throw new Error(err);
    }
  }

  async delete(tx: any, id: string, key: string): Promise<any> {
    try{
      const deleteData = await tx[key].delete({
        where: {
          id: id,
        },
      });
      return deleteData;
    }
    catch(err:any){
      console.log("error", err);
      throw new Error(err);
    }
  }
  async getBookcabinet(id: string): Promise<any> {
    try {
      const book_cabinet = await this.prisma.bookcabinet.findFirst({
        where: {
          cs_purchase_id: id,
        },
        include: {
          bookcabinet_picture: true,
        },
      });
      return book_cabinet;
    } catch (err: any) {
      console.log("Error getBookcabinet", err);
      throw new Error(err);
    }
  }

  async getReceipt(id: string): Promise<any> {
    try {
      const getReceipt = await this.prisma.receive.findFirst({
        where: {
          cs_purchase_id: id,
        },
        include: {
          receive_picture: true,
        },
      });
      return getReceipt;
    } catch (err: any) {
      console.log("Error getReceipt", err);
      throw new Error(err);
    }
  }

  

  async getContain(id: string): Promise<any> {
    try {
      const getContain = await this.prisma.contain.findFirst({
        where: {
          cs_purchase_id: id,
        },
        include: {
          contain_product: true,
          contain_picture: true,
        },
      });
      return getContain;
    } catch (err: any) {
      console.log("Error getContain", err);
      throw new Error(err);
    }
  }

  async getDataContainPicture(tx:any,contain_id:string,id: string): Promise<any> {
    try{
      const contain_picture = await tx.contain_picture.findMany({
        where: {
          id: {
            not : {
              in: id
            },
          },
          contain_id: contain_id,
        },
      });
      return contain_picture;
    }
    catch(err:any){
      console.log("Error getDataContainPicture", err);
      throw new Error(err);
    }

  }

  async getDatasuccessreleasefile(tx:any,success_release_id:string,id: string): Promise<any> {
    try{
      const success_release_file = await tx.cs_inspection_file.findMany({
        where: {
          id: {
            not : {
              in: id
            },
          },
          cs_inspection_id: success_release_id,
        },
      });
      return success_release_file;
    }
    catch(err:any){
      console.log("Error getDatasuccessreleasefile", err);
      throw new Error(err);
    }
  }

  async getDataleavefile(tx:any,leave_id:string,id: string): Promise<any> {
    try{
      const leaveFile = await tx.leavefile.findMany({
        where: {
          id: {
            not : {
              in: id
            },
          },
          leave_id: leave_id,
        },
      });
      return leaveFile;
    }
  
  catch(err:any){
    console.log("Error getDataleavefile", err);
    throw new Error(err);
  }
}
  

  async getDatareleasefile(tx:any,release_id:string,id: string): Promise<any> {
    try{
      const releaseFile = await tx.waitrelease_file.findMany({
        where: {
          id: {
            not : {
              in: id
            },
          },
          waitrelease_id: release_id,
        },
      });
      return releaseFile;
  }
  catch(err:any){
    console.log("Error getDatareleasefile", err);
    throw new Error(err);
  }
}

  async getDatareturnfile(tx:any,return_cabinet_id:string,id: string): Promise<any> {
    try{
      const contain_picture = await tx.cs_return_cabinet_file.findMany({
        where: {
          id: {
            not : {
              in: id
            },
          },
          return_cabinet_id: return_cabinet_id,
        },
      });
      return contain_picture;
    }
    catch(err:any){
      console.log("Error getDataContainPicture", err);
      throw new Error(err);
    }

  }

  async getDatadocument(tx:any,document_id:string,id: string): Promise<any> {
    try{
      const contain_picture = await tx.cs_document_file.findMany({
        where: {
          id: {
            not : {
              in: id
            },
          },
          cs_document_id: document_id
        },
      });
      return contain_picture;
    }
    catch(err:any){
      console.log("Error getDataContainPicture", err);
      throw new Error(err);
    }

  }
  async createCsPurchase(tx: any, data: any): Promise<any> {
    try {
      const cs_purchase = await tx.cs_purchase.create({
        data: data,
      });
      return cs_purchase;
    } catch (err: any) {
      console.log("Error Notification", err);
      throw new Error(err);
    }
  }

  async createBookcabinetPicture(tx: any, data: any): Promise<any> {
    try {
      const book_cabinet_picture = await tx.bookcabinet_picture.create({
        data: data,
      });
      return book_cabinet_picture;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createReceivePicture(tx: any, data: any): Promise<any> {
    try {
      const receive_picture = await tx.Receive_picture.create({
        data: data,
      });
      return receive_picture;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createContainProduct(tx: any, data: any, id: string): Promise<any> {
    //createProduct
    try {
      const contain = await tx.Contain_product.createMany({
        data: data.map((item: any) => {
          return {
            ...item,
            contain_id: id,
          };
        }),
      });
      return contain;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createContainPicture(tx: any, data: any): Promise<any> {
    try {
      const contain_picture = await tx.Contain_picture.create({
        data: data,
      });
      return contain_picture;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createDocument(tx: any, data: any, key: string): Promise<any> {
    //create
    try {
      const id = await tx[key].create({
        data: data,
      });
      return id;
    } catch (err: any) {
      console.log("errorcreateDocument", err);
      throw new Error(err);
    }
  }

  async getEtc(id: string): Promise<any> {
    try {
      const etc = await this.prisma.cs_etc.findFirst({
        where: {
          cs_purchase_id: id,
        },
      });
      return etc;
    } catch (err: any) {
      console.log("Error getEtc", err);
      throw new Error(err);
    }
  }

  async createEtc(tx: any, data: any): Promise<any> {
    try {
      
      // const dataEtc = {
      //   ...data,
      //   cs_purchase_id: data.cs_purchase_id,
      // }

      const etc = await tx.cs_etc.create({
        data: {
          ...data,
          cs_purchase_id: data.cs_purchase_id,
        },
      });
      return etc;
    } catch (err: any) {
      console.log("Error createEtc", err);
      throw new Error(err);
    }
  }
}

export default CsStatusRepository;
