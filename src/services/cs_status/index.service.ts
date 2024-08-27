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
}
