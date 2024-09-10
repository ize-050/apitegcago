import { Request, Response } from "express";
import CsStatusRepository from "../../repository/cs_status/index.repository";
import NotificationRepository from "../../repository/notification/index.repository";
import Csservice from "../cs/index.service";

import { PrismaClient } from "@prisma/client";

import moment from "moment";
import path from "path";
import fs from "fs";
import { RequestProductImage } from "../../interface/sale.interface";

export class CSStatusService {
  private csStatusRepository: CsStatusRepository;
  private csService: Csservice;
  private notificationRepo: NotificationRepository;
  private prisma;

  constructor() {
    this.csStatusRepository = new CsStatusRepository();
    this.prisma = new PrismaClient();
    this.csService = new Csservice();
    this.notificationRepo = new NotificationRepository();
  }

  async getDataCsStatus(id: string): Promise<any> {
    try {
      const cs_purchase = await this.csStatusRepository.getDataCsStatus(id);
      return cs_purchase;
    } catch (err: any) {
      console.log("Error getDataCsStatus", err);
      throw new Error(err);
    }
  }

  async getBookcabinet(id: string): Promise<any> {
    //จองตู้
    try {
      const cs_purchase = await this.csStatusRepository.getBookcabinet(id);

      const response = {
        data: cs_purchase,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("Error getBookcabinet", err);
      throw new Error(err);
    }
  }

  async getReceipt(id: string): Promise<any> {
    //รับตู้
    try {
      const getReceipt = await this.csStatusRepository.getReceipt(id);
      const response = {
        data: getReceipt,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("Error getReceipt", err);
      throw new Error(err);
    }
  }

  async getContain(id: string): Promise<any> {
    try {
      const getContain = await this.csStatusRepository.getContain(id);
      const response = {
        data: getContain,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("Error getContain", err);
      throw new Error(err);
    }
  }

  async getDocumentStatus(id: string): Promise<any> {
    try {
      const getDocument = await this.csStatusRepository.getDocumentStatus(id);
      const response = {
        data: getDocument,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("Error getDocumentStatus", err);
      throw new Error(err);
    }
  }

  async getDeparture(id: string): Promise<any> {
    try {
      const getDeparture = await this.csStatusRepository.getDeparture(id);
      const response = {
        data: getDeparture,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("Error getDeparture", err);
      throw new Error(err);
    }
  }

  async getWaitRelease(id: string): Promise<any> {
    try {
      const getWaitRelease = await this.csStatusRepository.getWaitRelease(id);
      const response = {
        data: getWaitRelease,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("Error getWaitRelease", err);
      throw new Error(err);
    }
  }

  async getSuccessRelease(id: string): Promise<any> {
    try{
        const getSuccessRelease = await this.csStatusRepository.getSuccessRelease(id);
        const response = {
            data: getSuccessRelease,
            statusCode: 200,
        };
        return response;
    }
    catch (err: any) {
        console.log("Error getSuccessRelease", err);
        throw new Error(err);
    }
}

  async createBookcabinet(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "bookcabinet",
        `${RequestData.d_purchase_id}`
      );

      await fs.mkdirSync(uploadDir, { recursive: true });

      await this.prisma.$transaction(async (tx) => {
        try {
          console.log("RequestData", RequestData);
          const cs_purchaseData = {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "Bookcabinet",
            number_key: 1,
            status_name: "จองตู้",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );
          const create_book_cabinet = {
            cs_purchase_id: cs_purchase.id,
            date_receiving: RequestData.date_receiving,
            date_booking: RequestData.date_booking,
            time_entering: RequestData.time_entering,
            agentcy_id: RequestData.agentcy_id,
            agentcy_etc: RequestData.agent_boat,
            data_entering: RequestData.data_entering,
          };

          const book_cabinet = await this.csStatusRepository.create(
            tx,
            create_book_cabinet,
            "bookcabinet"
          );

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                bookcabinet_id: book_cabinet.id,
                picture_name: file.filename,
                picture_path: `/images/bookcabinet/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const book_cabinet_image =
                await this.csStatusRepository.createBookcabinetPicture(
                  tx,
                  d_image
                );

              if (book_cabinet_image) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }

              const purchase_detail = await this.csService.getPurchaseDetail(
                RequestData.d_purchase_id
              );

              let RequestSentNotifaction = {
                user_id: purchase_detail.d_purchase_emp[0].user_id,
                purchase_id: RequestData.d_purchase_id,
                link_to: `purchase/content/` + RequestData.d_purchase_id,
                title: "CS (จองตู้)",
                subject_key: RequestData.d_purchase_id,
                message: `Cs จองตู้ เลขที่:${purchase_detail.book_number}`,
                status: false,
                data: {},
              };
              RequestSentNotifaction.data = JSON.stringify(
                RequestSentNotifaction
              );
              const notification = await this.notificationRepo.sendNotification(
                RequestSentNotifaction
              );
            }
          }
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });
      const response = {
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("createFail", err);
      throw new Error(err);
    }
  }

  async createReceive(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "receive",
        `${RequestData.d_purchase_id}`
      );

      await fs.mkdirSync(uploadDir, { recursive: true });

      await this.prisma.$transaction(async (tx) => {
        try {
          console.log("RequestData", RequestData);
          const cs_purchaseData = {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "Receive",
            number_key: 2,
            status_name: "รับตู้",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );
          const create_book_cabinet = {
            cs_purchase_id: cs_purchase.id,
            date_booking: RequestData.date_booking,
            so_no: RequestData.so_no,
            container_no: RequestData.container_no,
          };

          const receive_id = await this.csStatusRepository.create(
            tx,
            create_book_cabinet,
            "receive"
          );

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                receive_id: receive_id.id,
                picture_name: file.filename,
                picture_path: `/images/receive/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const book_cabinet_image =
                await this.csStatusRepository.createReceivePicture(tx, d_image);

              if (book_cabinet_image) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
              const purchase_detail = await this.csService.getPurchaseDetail(
                RequestData.d_purchase_id
              );
              let RequestSentNotifaction = {
                user_id: purchase_detail.d_purchase_emp[0].user_id,
                purchase_id: RequestData.d_purchase_id,
                link_to: `purchase/content/` + RequestData.d_purchase_id,
                title: "CS (รับตู้)",
                subject_key: RequestData.d_purchase_id,
                message: `Cs รับตู้ เลขที่:${purchase_detail.book_number}`,
                status: false,
                data: {},
              };
              RequestSentNotifaction.data = JSON.stringify(
                RequestSentNotifaction
              );
              const notification = await this.notificationRepo.sendNotification(
                RequestSentNotifaction
              );
            }
          }
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });
      const response = {
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("createFail", err);
      throw new Error(err);
    }
  }

  async createContain(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "contain",
        `${RequestData.d_purchase_id}`
      );

      await fs.mkdirSync(uploadDir, { recursive: true });

      await this.prisma.$transaction(async (tx) => {
        try {
          console.log("RequestData", RequestData);
          const cs_purchaseData = {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "Contain",
            number_key: 3,
            status_name: "บรรจุตู้",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );
          const create_contain = {
            cs_purchase_id: cs_purchase.id,
            date_booking: RequestData.date_booking,
            catbon_total: RequestData.catbon_total,
            cmb_total: RequestData.cmb_total,
            nw_total: RequestData.nw_total,
            gw_total: RequestData.gw_total,
          };

          const contain = await this.csStatusRepository.create(
            tx,
            create_contain,
            "contain"
          );

          const contain_product =
            await this.csStatusRepository.createContainProduct(
              tx,
              JSON.parse(RequestData.items),
              contain.id
            );

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                contain_id: contain.id,
                picture_name: file.filename,
                picture_path: `/images/contain/${RequestData.d_purchase_id}/${file.filename}`,
                key: file.fieldname,
              };
              const contain_picture =
                await this.csStatusRepository.createContainPicture(tx, d_image);

              if (contain_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
              const purchase_detail = await this.csService.getPurchaseDetail(
                RequestData.d_purchase_id
              );
              let RequestSentNotifaction = {
                user_id: purchase_detail.d_purchase_emp[0].user_id,
                purchase_id: RequestData.d_purchase_id,
                link_to: `purchase/content/` + RequestData.d_purchase_id,
                title: "CS (บรรจุตู้)",
                subject_key: RequestData.d_purchase_id,
                message: `Cs บรรจุตู้ เลขที่:${purchase_detail.book_number}`,
                status: false,
                data: {},
              };
              RequestSentNotifaction.data = JSON.stringify(
                RequestSentNotifaction
              );
              const notification = await this.notificationRepo.sendNotification(
                RequestSentNotifaction
              );
            }
          }
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });
      const response = {
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("createFail", err);
      throw new Error(err);
    }
  }

  async createDocument(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "cs_document",
        `${RequestData.d_purchase_id}`
      );
      await fs.mkdirSync(uploadDir, { recursive: true });

      await this.prisma.$transaction(async (tx) => {
        try {
          console.log("RequestData", RequestData);
          const cs_purchaseData = {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "Document",
            number_key: 4,
            status_name: "จัดทำเอกสาร",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );
          const create_document = {
            cs_purchase_id: cs_purchase.id,
            document_invoice_date: RequestData?.document_invoice_date,
            document_packinglist: RequestData?.document_packinglist,
            document_draft: RequestData?.document_draft,
            document_etc: RequestData?.document_etc,
            document_draft_invoice: RequestData?.document_draft_invoice,
            document_draft_bl: RequestData?.document_draft_bl,
            document_master_bl: RequestData?.document_master_bl,
          };

          const document = await this.csStatusRepository.create(
            tx,
            create_document,
            "cs_document"
          );

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                cs_document_id: document.id,
                file_name: file.filename,
                key: file.fieldname,
                file_path: `/images/cs_document/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const document_picture =
                await this.csStatusRepository.createDocument(
                  tx,
                  d_image,
                  "cs_document_file"
                );

              if (document_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
              const purchase_detail = await this.csService.getPurchaseDetail(
                RequestData.d_purchase_id
              );
              let RequestSentNotifaction = {
                user_id: purchase_detail.d_purchase_emp[0].user_id,
                purchase_id: RequestData.d_purchase_id,
                link_to: `purchase/content/` + RequestData.d_purchase_id,
                title: "CS (จัดทำเอกสาร)",
                subject_key: RequestData.d_purchase_id,
                message: `Cs จัดทำเอกสาร เลขที่:${purchase_detail.book_number}`,
                status: false,
                data: {},
              };
              RequestSentNotifaction.data = JSON.stringify(
                RequestSentNotifaction
              );
              const notification = await this.notificationRepo.sendNotification(
                RequestSentNotifaction
              );
            }
          }
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createDeparture(RequestData: Partial<any>): Promise<any> {
    try {
      await this.prisma.$transaction(async (tx) => {
        try {
          console.log("RequestData", RequestData);
          const cs_purchaseData = {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "Departure",
            number_key: 5,
            status_name: "ยืนยันวันออกเดินทาง",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );
          const create_departure = {
            cs_purchase_id: cs_purchase.id,
            date_etd: RequestData.date_etd,
            date_eta: RequestData.date_eta,
            post_origin: RequestData.post_origin,
            post_destination: RequestData.post_destination,
            vessel_name: RequestData.vessel_name,
          };

          const departure = await this.csStatusRepository.create(
            tx,
            create_departure,
            "ProveDeparture"
          );

          const purchase_detail = await this.csService.getPurchaseDetail(
            RequestData.d_purchase_id
          );
          let RequestSentNotifaction = {
            user_id: purchase_detail.d_purchase_emp[0].user_id,
            purchase_id: RequestData.d_purchase_id,
            link_to: `purchase/content/` + RequestData.d_purchase_id,
            title: "CS (ยืนยันวันออกเดินทาง)",
            subject_key: RequestData.d_purchase_id,
            message: `Cs ยืนยันวันออกเดินทาง เลขที่:${purchase_detail.book_number}`,
            status: false,
            data: {},
          };
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };

      return response;
    } catch (err: any) {
      console.log("errCreateDeparture", err);
      throw new Error(err);
    }
  }

  async createWaitRelease(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "wait_release",
        `${RequestData.d_purchase_id}`
      );
      await fs.mkdirSync(uploadDir, { recursive: true });

      await this.prisma.$transaction(async (tx) => {
        try {
          const cs_purchaseData = {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "WaitRelease",
            number_key: 7,
            status_name: "รอตรวจปล่อย",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );
          const create_release = {
            cs_purchase_id: cs_purchase.id,
            date_planing: RequestData?.date_planing,
            date_receive: RequestData?.date_receive,
            dem_free_time: RequestData?.dem_free_time,
            demurrage_dem_date: RequestData?.demurrage_dem_date,
            detention_det_date: RequestData?.detention_det_date,
            license_plate: RequestData?.license_plate,
            location_exchange: RequestData?.location_exchange,
            phone_number: RequestData?.phone_number,
            terminal_release: RequestData?.terminal_release,
            type_car: RequestData?.type_car,
            company_car: RequestData?.company_car,
            det_free_time: RequestData?.det_free_time,
          };

          const document = await this.csStatusRepository.create(
            tx,
            create_release,
            "waitrelease"
          );

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                waitrelease_id: document.id,
                file_name: file.filename,
                file_path: `/images/wait_release/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const document_picture =
                await this.csStatusRepository.createDocument(
                  tx,
                  d_image,
                  "waitrelease_file"
                );

              if (document_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
              const purchase_detail = await this.csService.getPurchaseDetail(
                RequestData.d_purchase_id
              );
              let RequestSentNotifaction = {
                user_id: purchase_detail.d_purchase_emp[0].user_id,
                purchase_id: RequestData.d_purchase_id,
                link_to: `purchase/content/` + RequestData.d_purchase_id,
                title: "CS (รอตรวจปล่อย)",
                subject_key: RequestData.d_purchase_id,
                message: `Cs รอตรวจปล่อย เลขที่:${purchase_detail.book_number}`,
                status: false,
                data: {},
              };
              RequestSentNotifaction.data = JSON.stringify(
                RequestSentNotifaction
              );
              const notification = await this.notificationRepo.sendNotification(
                RequestSentNotifaction
              );
            }
          }
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createSuccessRelease(RequestData: Partial<any>): Promise<any> {
    try {
        const uploadDir = path.join(
          "public",
          "images",
          "success_release",
          `${RequestData.d_purchase_id}`
        );
        await fs.mkdirSync(uploadDir, { recursive: true });
  
        await this.prisma.$transaction(async (tx) => {
          try {
            const cs_purchaseData = {
              d_purchase_id: RequestData.d_purchase_id,
              status_key: "Released",
              number_key: 8,
              status_name: "ปล่อยตรวจเรียบร้อย",
              status_active: true,
            };
  
            const cs_purchase = await this.csStatusRepository.createCsPurchase(
              tx,
              cs_purchaseData
            );
            const success_release = {
              cs_purchase_id: cs_purchase.id,
              shipping : RequestData.shipping,
              date_release: RequestData.date_release,
              date_do: RequestData.date_do,
              date_card: RequestData.date_card,
              date_return_document: RequestData.date_return_document,
              date_return_docu: RequestData.date_return_docu,         
            };
  
            const document = await this.csStatusRepository.create(
              tx,
              success_release,
              "cs_inspection"
            );
  
            if (RequestData.files.length > 0) {
              for (let file of RequestData.files) {
                const tempFilePath = file.path;
  
                const d_image = {
                  cs_inspection_id: document.id,
                  file_name: file.filename,
                  key: file.fieldname,
                  file_path: `/images/success_release/${RequestData.d_purchase_id}/${file.filename}`,
                };
                const document_picture =
                  await this.csStatusRepository.createDocument(
                    tx,
                    d_image,
                    "cs_inspection_file"
                  );
  
                if (document_picture) {
                  const newFilePath = path.join(uploadDir, file.filename);
                  await fs.renameSync(tempFilePath, newFilePath);
                }
                const purchase_detail = await this.csService.getPurchaseDetail(
                  RequestData.d_purchase_id
                );
                let RequestSentNotifaction = {
                  user_id: purchase_detail.d_purchase_emp[0].user_id,
                  purchase_id: RequestData.d_purchase_id,
                  link_to: `purchase/content/` + RequestData.d_purchase_id,
                  title: "CS (ปล่อยตรวจเรียบร้อย)",
                  subject_key: RequestData.d_purchase_id,
                  message: `Cs ปล่อยตรวจเรียบร้อย เลขที่:${purchase_detail.book_number}`,
                  status: false,
                  data: {},
                };
                RequestSentNotifaction.data = JSON.stringify(
                  RequestSentNotifaction
                );
                const notification = await this.notificationRepo.sendNotification(
                  RequestSentNotifaction
                );
              }
            }
          } catch (err: any) {
            console.log("createFail", err);
            throw new Error(err);
          }
        });
  
        const response = {
          message: "บันทึกข้อมูลสำเร็จ",
          statusCode: 200,
        };
        return response;
      } catch (err: any) {
        throw new Error(err);
      }
    }
}
