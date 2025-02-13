import { Request, Response } from "express";
import CsStatusRepository from "../../repository/cs_status/index.repository";
import NotificationRepository from "../../repository/notification/index.repository";
import CsRepository from "../../repository/cs/index.repository";
import Csservice from "../cs/index.service";
import SaleRepository from "../../repository/sale/index.repository";
import { PrismaClient } from "@prisma/client";

import moment from "moment";
import path from "path";
import fs from "fs";
import { RequestProductImage } from "../../interface/sale.interface";

export class CSStatusService {
  private csStatusRepository: CsStatusRepository;
  private csService: Csservice;
  private saleRepository: SaleRepository;
  private CsRepository: CsRepository;
  private notificationRepo: NotificationRepository;
  private prisma;

  constructor() {
    this.csStatusRepository = new CsStatusRepository();
    this.prisma = new PrismaClient();
    this.csService = new Csservice();
    this.notificationRepo = new NotificationRepository();
    this.saleRepository = new SaleRepository();
    this.CsRepository = new CsRepository();
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

  async getLeave(id: string): Promise<any> {
    try {
      const getLeave = await this.csStatusRepository.getLeave(id);
      const response = {
        data: getLeave,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("Error getLeave", err);
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
    try {
      const getSuccessRelease = await this.csStatusRepository.getSuccessRelease(
        id
      );
      const response = {
        data: getSuccessRelease,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("Error getSuccessRelease", err);
      throw new Error(err);
    }
  }

  async getDestination(id: string): Promise<any> {
    try {
      const getDestination = await this.csStatusRepository.getDestination(id);
      const response = {
        data: getDestination,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("Error getDestination", err);
      throw new Error(err);
    }
  }

  async getSentSuccess(id: string): Promise<any> {
    try {
      const getSentSuccess = await this.csStatusRepository.getSentSuccess(id);
      const response = {
        data: getSentSuccess,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("Error getSentSuccess", err);
      throw new Error(err);
    }
  }

  async getReturn(id: string): Promise<any> {
    try {
      const getReturn = await this.csStatusRepository.getReturn(id);
      const response = {
        data: getReturn,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("Error getReturn", err);
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

      const id = await this.prisma.$transaction(async (tx: any) => {
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
            date_entering: RequestData.date_entering,
            date_booking: RequestData.date_booking,
            time_entering: RequestData.time_entering,
            agentcy_id: RequestData.agentcy_id,
            agentcy_etc: RequestData.agent_boat,
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
          return cs_purchase.id;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });
      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("createFail", err);
      throw new Error(err);
    }
  }

  async updateBookcabinet(RequestData: Partial<any>): Promise<any> {
    try {
      const book_id = RequestData.id;
      delete RequestData.id;

      const uploadDir = path.join(
        "public",
        "images",
        "bookcabinet",
        `${RequestData.d_purchase_id}`
      );

      await fs.mkdirSync(uploadDir, { recursive: true });

      const id = await this.prisma.$transaction(async (tx: any) => {
        try {
          const cs_purchaseData = {
            date_receiving: RequestData?.date_receiving,
            date_entering: RequestData?.date_entering,
            date_booking: RequestData?.date_booking,
            time_entering: RequestData?.time_entering,
            agentcy_id: RequestData?.agentcy_id,
            agentcy_etc: RequestData?.agent_boat,
          };

          console.log("cs_purchaseData", cs_purchaseData);
          console.log("book_id", book_id);

          const cs_purchase = await this.csStatusRepository.update(
            tx,
            book_id,
            cs_purchaseData,
            "bookcabinet"
          );

          if (RequestData?.existingImageIds?.length > 0) {
            const dataRequest: any =
              await this.csStatusRepository.getDataBookcabinetPicture(
                tx,
                book_id,
                RequestData.existingImageIds
              );
            if (dataRequest.length > 0) {
              for (let file of dataRequest) {
                const tempFilePath = file.picture_path;
                const newFilePath = path.join(uploadDir, file.picture_name);

                await fs.unlinkSync(newFilePath);

                await this.csStatusRepository.delete(
                  tx,
                  file.id,
                  "bookcabinet_picture"
                );
              }
            }
          }

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                bookcabinet_id: book_id,
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
        } catch (err: any) {
          console.log("Error updateBookcabinet", err);
          throw new Error(err);
        }
      });

      return id;
    } catch (err: any) {
      console.log("Error updateBookcabinet", err);
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

      const id = await this.prisma.$transaction(async (tx: any) => {
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
            phone_no: RequestData.phone_no,
            license_plate: RequestData.license_plate,
            so_no: RequestData.so_no,
            container_no: RequestData.container_no,
          };

          const receive_id = await this.csStatusRepository.create(
            tx,
            create_book_cabinet,
            "receive"
          );

          const getStatusContain: any = await this.prisma.cs_purchase.findFirst(
            {
              where: {
                d_purchase_id: RequestData.d_purchase_id,
                status_key: "Contain",
              },
              select: {
                id: true,
              },
            }
          );

          let contain_id: any = "";

          if (getStatusContain?.id != null) {
            const contains = await this.prisma.contain.findUnique({
              where: {
                cs_purchase_id: getStatusContain.id,
              },
            });
            contain_id = contains;
          }

          if (contain_id != "") {
            const getTransport = await this.CsRepository.getTransport(
              RequestData.d_purchase_id
            );
            const check = await this.saleRepository.checkShipmentNumber(
              contain_id.type_contain
            );
            if (typeof check === "undefined") {
              RequestData.d_shipment_number =
                contain_id.type_contain +
                "001-" +
                moment().format("YYMMDD") +
                "-" +
                RequestData.container_no.slice(-4);
              await tx.d_purchase.update({
                where: { id: RequestData.d_purchase_id },
                data: {
                  d_shipment_number: RequestData.d_shipment_number,
                  updatedAt: new Date(),
                },
              });
            } else {
              const check = await this.saleRepository.checkShipmentNumberLast(
                contain_id.type_contain
              );
              console.log("lastShipmentNumber", check);
              const [prefix, , sequence] = check.split("-"); // Ignore the date part

              // Find the numeric part of the prefix
              const prefixMatch = prefix.match(/^(\D+)(\d+)$/);
              if (prefixMatch) {
                const prefixText = prefixMatch[1];
                const prefixNumber = parseInt(prefixMatch[2], 10) + 1; // Increment the numeric part
                const newPrefix =
                  prefixText + prefixNumber.toString().padStart(3, "0"); // Ensure prefix number is always 3 digits

                RequestData.d_shipment_number =
                  newPrefix +
                  "-" +
                  moment().format("YYMMDD") +
                  "-" +
                  RequestData.container_no.slice(-4);
              } else {
                console.error(
                  "Prefix does not match expected pattern:",
                  prefix
                );
              }
            }

            await tx.d_purchase.update({
              where: { id: RequestData.d_purchase_id },
              data: {
                d_shipment_number: RequestData.d_shipment_number,
                updatedAt: new Date(),
              },
            });
          }

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
            }
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
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return cs_purchase.id;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });
      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("createFail", err);
      throw new Error(err);
    }
  }

  async updateReceive(RequestData: Partial<any>): Promise<any> {
    try {
      const id = RequestData.id;
      delete RequestData.id;
      const uploadDir = path.join(
        "public",
        "images",
        "receive",
        `${RequestData.d_purchase_id}`
      );

      await fs.mkdirSync(uploadDir, { recursive: true });

      const updatedRecord = await this.prisma.$transaction(async (tx: any) => {
        // ตรวจสอบการมีอยู่ของข้อมูล
        const existingRecord = await tx.receive.findUnique({
          where: { id: id },
        });

        if (!existingRecord) {
          throw new Error(`Record with id ${id} not found in receive`);
        }

        const getStatusContain: any = await this.prisma.cs_purchase.findFirst({
          where: {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "Contain",
          },
          select: {
            id: true,
          },
        });

        let contain_id: any = "";

        console.log("getStatusContain", getStatusContain);

        if (getStatusContain?.id != null) {  
          const contains = await this.prisma.contain.findUnique({
            where: {
              cs_purchase_id: getStatusContain.id,
            },
          });
          contain_id = contains;
        }

        console.log("contain_id", contain_id);

        if (contain_id != "") {
          const getTransport = await this.CsRepository.getTransport(
            contain_id.type_contain
          );

          const check = await this.saleRepository.checkShipmentNumber(
            contain_id.type_contain
          );

          if (RequestData.container_no) {
            if (typeof check === "undefined") {
              RequestData.d_shipment_number =
                contain_id.type_contain +
                "001-" +
                moment().format("YYMMDD") +
                "-" +
                RequestData.container_no.slice(-4);
              await tx.d_purchase.update({
                where: { id: RequestData.d_purchase_id },
                data: {
                  d_shipment_number: RequestData.d_shipment_number,
                  updatedAt: new Date(),
                },
              });
            } else {
              const check = await this.saleRepository.checkShipmentNumberLast(
                contain_id.type_contain
              );
              console.log("lastShipmentNumber", check);

              const lastShipmentNumber = check;

              const [prefix, , sequence] = lastShipmentNumber.split("-"); // Ignore the date part

              // Find the numeric part of the prefix
              const prefixMatch = prefix.match(/^(\D+)(\d+)$/);
              if (prefixMatch) {
                const prefixText = prefixMatch[1];
                const prefixNumber = parseInt(prefixMatch[2], 10) ; // Increment the numeric part
                const newPrefix =
                  prefixText + prefixNumber.toString().padStart(3, "0"); // Ensure prefix number is always 3 digits
                console.log("newPrefix", newPrefix);
                RequestData.d_shipment_number =
                  newPrefix +
                  "-" +
                  moment().format("YYMMDD") +
                  "-" +
                  RequestData.container_no.slice(-4);

                await tx.d_purchase.update({
                  where: { id: RequestData.d_purchase_id },
                  data: {
                    d_shipment_number: RequestData.d_shipment_number,
                    updatedAt: new Date(),
                  },
                });
              } else {
                console.error(
                  "Prefix does not match expected pattern:",
                  prefix
                );
              }
            }
          }
        }

        // ทำการอัปเดต
        const update = await tx.receive.update({
          where: { id: id },
          data: {
            // ใส่ฟิลด์ที่ต้องการอัปเดต
            date_booking: RequestData.date_booking,
            phone_no: RequestData.phone_no,
            license_plate: RequestData.license_plate,
            so_no: RequestData.so_no,
            container_no: RequestData.container_no,
            // เพิ่มฟิลด์อื่น ๆ ตามที่ต้องการ
          },
        });
        console.log(
          "RequestData.existingImageIds",
          RequestData.existingImageIds
        );
        if (
          RequestData.existingImageIds &&
          RequestData.existingImageIds.length > 0
        ) {
          const existingImages =
            await this.csStatusRepository.getDataReceivePicture(
              tx,
              id,
              RequestData.existingImageIds
            );

          for (let image of existingImages) {
            const imagePath = path.join(uploadDir, image.picture_name);
            await fs.unlinkSync(imagePath); // ลบไฟล์จากระบบไฟล์
            await this.csStatusRepository.delete(
              tx,
              image.id,
              "receive_picture"
            ); // ลบข้อมูลจากฐานข้อมูล
          }
        }

        // จัดการไฟล์ที่อัปโหลด (ถ้ามี)
        if (RequestData.files && RequestData.files.length > 0) {
          for (let file of RequestData.files) {
            const tempFilePath = file.path;
            const d_image = {
              receive_id: id,
              picture_name: file.filename,
              picture_path: `/images/receive/${RequestData.d_purchase_id}/${file.filename}`,
            };
            const book_cabinet_image =
              await this.csStatusRepository.createReceivePicture(tx, d_image);

            if (book_cabinet_image) {
              const newFilePath = path.join(uploadDir, file.filename);
              await fs.renameSync(tempFilePath, newFilePath);
            }
          }
        }

        return update;
      });

      // ส่ง Notification
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
      RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
      const notification = await this.notificationRepo.sendNotification(
        RequestSentNotifaction
      );

      return updatedRecord;
    } catch (err: any) {
      console.log("Error updateReceive", err);
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

      const id = await this.prisma.$transaction(async (tx: any) => {
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
            type_contain: RequestData.type_contain,
            date_booking: RequestData.date_booking,
            carbon_total: RequestData.carbon_total,
            cmb_total: RequestData.cmb_total,
            nw_total: RequestData.nw_total,
            gw_total: RequestData.gw_total,
          };

          const getContainerNo = await this.prisma.cs_purchase.findFirst({
            where: {
              d_purchase_id: RequestData.d_purchase_id,
              status_key: "Receive",
            },
          });

          let container_no: any = "";

          console.log("getContainerNo", getContainerNo);
          if (getContainerNo) {
            container_no = await this.prisma.receive.findUnique({
              where: {
                cs_purchase_id: getContainerNo.id,
              },
              select: {
                container_no: true,
              },
            });
          }

          const getTransport = await this.CsRepository.getTransport(
            RequestData.d_purchase_id
          );

          const check = await this.saleRepository.checkShipmentNumber(
            RequestData.type_contain
          );
          if (container_no != "") {
            if (typeof check === "undefined") {
              RequestData.d_shipment_number =
                RequestData.type_contain +
                "001-" +
                moment(RequestData.date_booking).format("YYMMDD") +
                "-" +
                container_no.container_no.slice(-4);
              await tx.d_purchase.update({
                where: { id: RequestData.d_purchase_id },
                data: {
                  d_shipment_number: RequestData.d_shipment_number,
                  updatedAt: new Date(),
                },
              });
            } else {
              const check = await this.saleRepository.checkShipmentNumberLast(
                RequestData.type_contain
              );
              console.log("lastShipmentNumber", check);
              const [prefix, , sequence] = check.split("-"); // Ignore the date part

              // Find the numeric part of the prefix
              const prefixMatch = prefix.match(/^(\D+)(\d+)$/);
              if (prefixMatch) {
                const prefixText = prefixMatch[1];
                const prefixNumber = parseInt(prefixMatch[2], 10) + 1; // Increment the numeric part
                const newPrefix =
                  prefixText + prefixNumber.toString().padStart(3, "0"); // Ensure prefix number is always 3 digits

                RequestData.d_shipment_number =
                  newPrefix +
                  "-" +
                  moment(RequestData.date_booking).format("YYMMDD") +
                  "-" +
                  container_no.container_no.slice(-4);
              } else {
                console.error(
                  "Prefix does not match expected pattern:",
                  prefix
                );
              }
            }

            await tx.d_purchase.update({
              where: { id: RequestData.d_purchase_id },
              data: {
                d_shipment_number: RequestData.d_shipment_number,
                updatedAt: new Date(),
              },
            });
          }

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
            }
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
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return cs_purchase.id;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });
      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("createFail", err);
      throw new Error(err);
    }
  }

  async editContain(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "contain",
        `${RequestData.d_purchase_id}`
      );

      await fs.mkdirSync(uploadDir, { recursive: true });

      const id = await this.prisma.$transaction(async (tx) => {
        try {
          const contain_id = RequestData?.id;
          delete RequestData.id;

          console.log("RequestData", RequestData.d_purchase_id);

          const getContainerNo = await this.prisma.cs_purchase.findFirst({
            where: {
              d_purchase_id: RequestData.d_purchase_id,
              status_key: "Receive",
            },
          });

          

          let container_no: any = "";
          if (getContainerNo) {
            container_no = await this.prisma.receive.findUnique({
              where: {
                cs_purchase_id: getContainerNo.id,
              },
              select: {
                container_no: true,
              },
            });
          }

          console.log("container_no", container_no);

          const getTransport = await this.CsRepository.getTransport(
            RequestData.d_purchase_id
          );

          const check = await this.saleRepository.checkShipmentNumber(
            RequestData.type_contain
          );

       

          if (container_no?.container_no != "" && RequestData?.type_contain != "") {
            if (typeof check === "undefined") {
              console.log("RequestData.type_contain", RequestData);
              console.log("check", check);
              RequestData.d_shipment_number =
                RequestData.type_contain +
                "001-" +
                moment(RequestData.date_booking).format("YYMMDD") +
                "-" +
                container_no.container_no.slice(-4);
              console.log(
                "RequestData.d_shipment_number",
                RequestData.d_shipment_number
              );
              await tx.d_purchase.update({
                where: { id: RequestData.d_purchase_id },
                data: {
                  d_shipment_number: RequestData.d_shipment_number,
                  updatedAt: new Date(),
                },
              });
            } else {
              const check = await this.saleRepository.checkShipmentNumberLast(
                RequestData.type_contain
              );

              const [prefix, , sequence] = check.split("-"); // Ignore the date part

              const prefixMatch = prefix.match(/^(\D+)(\d+)$/);
              if (prefixMatch) {
                const prefixText = prefixMatch[1];
                const prefixNumber = parseInt(prefixMatch[2], 10) + 1; // Increment the numeric part
                const newPrefix =
                  prefixText + prefixNumber.toString().padStart(3, "0"); // Ensure prefix number is always 3 digits
                RequestData.d_shipment_number =
                  newPrefix +
                  "-" +
                  moment(RequestData.date_booking).format("YYMMDD") +
                  "-" +
                  container_no.container_no.slice(-4);
              } else {
                console.error(
                  "Prefix does not match expected pattern:",
                  prefix
                );
              }
            }

            await tx.d_purchase.update({
              where: { id: RequestData.d_purchase_id },
              data: {
                d_shipment_number: RequestData.d_shipment_number,
                updatedAt: new Date(),
              },
            });
          }

          const edit_contain = {
            type_contain: RequestData?.type_contain,
            date_booking: RequestData?.date_booking,
            carbon_total: RequestData?.carbon_total,
            cmb_total: RequestData?.cmb_total,
            nw_total: RequestData?.nw_total,
            gw_total: RequestData?.gw_total,
          };

          const contain = await this.csStatusRepository.update(
            tx,
            contain_id,
            edit_contain,
            "contain"
          );

          if (RequestData?.existingImageIds?.length > 0) {
            const dataRequest: any =
              await this.csStatusRepository.getDataContainPicture(
                tx,
                contain_id,
                RequestData.existingImageIds
              );
            console.log(dataRequest, "dataRequest");
            if (dataRequest.length > 0) {
              for (let file of dataRequest) {
                const tempFilePath = file.picture_path;
                const newFilePath = path.join(uploadDir, file.picture_name);

                await fs.unlinkSync(newFilePath);

                await this.csStatusRepository.delete(
                  tx,
                  file.id,
                  "contain_picture"
                );
              }
            }
          }

          // const contain_product = await this.csStatusRepository.createOrupdate(
          //     tx,
          //     JSON.parse(RequestData.items),
          //     id
          //   );

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
            }
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
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);

          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return contain;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });
      const response = {
        id: id,
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

      const id = await this.prisma.$transaction(async (tx) => {
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
            }
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
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return cs_purchase.id;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async editDocument(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "cs_document",
        `${RequestData.d_purchase_id}`
      );
      await fs.mkdirSync(uploadDir, { recursive: true });
      const id = await this.prisma.$transaction(async (tx: any) => {
        try {
          console.log("RequestData", RequestData);
          const edit = {
            cs_purchase_id: RequestData.cs_purchase_id,
            document_invoice_date: RequestData?.document_invoice_date,
            document_packinglist: RequestData?.document_packinglist,
            document_draft: RequestData?.document_draft,
            document_etc: RequestData?.document_etc,
            document_draft_invoice: RequestData?.document_draft_invoice,
            document_draft_bl: RequestData?.document_draft_bl,
            document_master_bl: RequestData?.document_master_bl,
          };

          const document = await this.csStatusRepository.update(
            tx,
            RequestData.id,
            edit,
            "cs_document"
          );

          if (RequestData?.existingImageIds?.length > 0) {
            const dataRequest: any =
              await this.csStatusRepository.getDatadocument(
                tx,
                RequestData.id,
                RequestData.existingImageIds
              );
            if (dataRequest.length > 0) {
              for (let file of dataRequest) {
                const tempFilePath = file.file_path;
                const newFilePath = path.join(uploadDir, file.file_name);

                await fs.unlinkSync(newFilePath);

                await this.csStatusRepository.delete(
                  tx,
                  file.id,
                  "cs_document_file"
                );
              }
            }
          }

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
            }
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
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return true;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        id: id,
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
      const id = await this.prisma.$transaction(async (tx: any) => {
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
            date_etd: RequestData?.date_etd,
            date_eta: RequestData?.date_eta,
            post_origin: RequestData?.post_origin,
            post_destination: RequestData?.post_destination,
            vessel_name: RequestData?.vessel_name,
            bl_no: RequestData?.bl_no,
          };
          console.log("create_departure", create_departure);
          const departure = await this.csStatusRepository.create(
            tx,
            create_departure,
            "provedeparture"
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
          return cs_purchase.id;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };

      return response;
    } catch (err: any) {
      console.log("errCreateDeparture", err);
      throw new Error(err);
    }
  }

  async updateDeparture(RequestData: Partial<any>): Promise<any> {
    try {
      const id = await this.prisma.$transaction(async (tx) => {
        try {
          const edit_departure = {
            date_etd: RequestData?.date_etd,
            date_eta: RequestData?.date_eta,
            post_origin: RequestData?.post_origin,
            post_destination: RequestData?.post_destination,
            vessel_name: RequestData?.vessel_name,
            bl_no: RequestData?.bl_no,
          };

          console.log("edit_departure", edit_departure);

          console.log("RequestData.id,", RequestData.id);

          const departure = await this.csStatusRepository.update(
            tx,
            RequestData.id,
            edit_departure,
            "provedeparture"
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
          return true;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };

      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createLeave(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "leave",
        `${RequestData.d_purchase_id}`
      );
      await fs.mkdirSync(uploadDir, { recursive: true });

      const id = await this.prisma.$transaction(async (tx) => {
        try {
          console.log("RequestData", RequestData);
          const cs_purchaseData = {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "Leave",
            number_key: 6,
            status_name: "ออกเดินทาง",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );
          const create_document = {
            cs_purchase_id: cs_purchase.id,
            date_hbl: RequestData?.date_hbl,
            date_original_fe: RequestData?.date_original_fe,
            date_surrender: RequestData?.date_surrender,
            check_price_deposit:
              RequestData?.check_price_deposit === "true" ? true : false,
            price_deposit: RequestData?.price_deposit,
            date_enter_doc: RequestData?.date_enter_doc,
            file_enter_doc: RequestData?.file_enter_doc,
            date_payment_do: RequestData?.date_payment_do,
            payment_date: RequestData?.payment_date,
            amount_payment_do: RequestData?.amount_payment_do,
          };

          const leave = await this.csStatusRepository.create(
            tx,
            create_document,
            "leave"
          );

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                leave_id: leave.id,
                file_name: file.filename,
                key: file.fieldname,
                file_path: `/images/leave/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const document_picture =
                await this.csStatusRepository.createDocument(
                  tx,
                  d_image,
                  "leavefile"
                );

              if (document_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
            }
          }

          const purchase_detail = await this.csService.getPurchaseDetail(
            RequestData.d_purchase_id
          );
          let RequestSentNotifaction = {
            user_id: purchase_detail.d_purchase_emp[0].user_id,
            purchase_id: RequestData.d_purchase_id,
            link_to: `purchase/content/` + RequestData.d_purchase_id,
            title: "CS (ออกเดินทาง)",
            subject_key: RequestData.d_purchase_id,
            message: `Cs ออกเดินทาง เลขที่:${purchase_detail.book_number}`,
            status: false,
            data: {},
          };
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return cs_purchase.id;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async editLeave(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "leave",
        `${RequestData.d_purchase_id}`
      );
      await fs.mkdirSync(uploadDir, { recursive: true });

      const id = await this.prisma.$transaction(async (tx: any) => {
        try {
          console.log("RequestData", RequestData);

          const create_document = {
            cs_purchase_id: RequestData.cs_purchase_id,
            date_hbl: RequestData?.date_hbl,
            date_original_fe: RequestData?.date_original_fe,
            date_surrender: RequestData?.date_surrender,
            check_price_deposit:
              RequestData?.check_price_deposit === "true" ? true : false,
            price_deposit: RequestData?.price_deposit,
            date_enter_doc: RequestData?.date_enter_doc,
            file_enter_doc: RequestData?.file_enter_doc,
            date_payment_do: RequestData?.date_payment_do,
            payment_date: RequestData?.payment_date,
            amount_payment_do: RequestData?.amount_payment_do,
          };

          const leave = await this.csStatusRepository.update(
            tx,
            RequestData.id,
            create_document,
            "leave"
          );

          if (RequestData?.existingImageIds?.length > 0) {
            const dataRequest: any =
              await this.csStatusRepository.getDataleavefile(
                tx,
                leave.id,
                RequestData.existingImageIds
              );
            if (dataRequest.length > 0) {
              for (let file of dataRequest) {
                const tempFilePath = file.file_path;
                await fs.unlinkSync(tempFilePath);
                await this.csStatusRepository.delete(tx, file.id, "leavefile");
              }
            }
          }

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                leave_id: leave.id,
                file_name: file.filename,
                key: file.fieldname,
                file_path: `/images/leave/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const document_picture =
                await this.csStatusRepository.createDocument(
                  tx,
                  d_image,
                  "leavefile"
                );

              if (document_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
            }
          }

          const purchase_detail = await this.csService.getPurchaseDetail(
            RequestData.d_purchase_id
          );
          let RequestSentNotifaction = {
            user_id: purchase_detail.d_purchase_emp[0].user_id,
            purchase_id: RequestData.d_purchase_id,
            link_to: `purchase/content/` + RequestData.d_purchase_id,
            title: "CS (ออกเดินทาง)",
            subject_key: RequestData.d_purchase_id,
            message: `Cs ออกเดินทาง เลขที่:${purchase_detail.book_number}`,
            status: false,
            data: {},
          };
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return true;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
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

      const id = await this.prisma.$transaction(async (tx) => {
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
            location_do: RequestData?.location_do,
            demurrage_dem_date: RequestData?.demurrage_dem_date,
            detention_det_date: RequestData?.detention_det_date,
            license_plate: RequestData?.license_plate,
            location_exchange: RequestData?.location_exchange,
            phone_number: RequestData?.phone_number,
            terminal_release: RequestData?.terminal_release,
            type_car: RequestData?.type_car,
            employee_driver: RequestData?.employee_driver,
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
            }
            const purchase_detail = await this.csService.getPurchaseDetail(
              RequestData.d_purchase_id
            );
            let RequestSentNotifaction = {
              user_id: purchase_detail.d_purchase_emp[0].user_id,
              purchase_id: RequestData.d_purchase_id,
              link_to: `purchase/content/` + RequestData.d_purchase_id,
              title: "CS (จอตรวจปล่อย)",
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
          return cs_purchase.id;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async editWaitRelease(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "wait_release",
        `${RequestData.d_purchase_id}`
      );

      await fs.mkdirSync(uploadDir, { recursive: true });

      const id = await this.prisma.$transaction(async (tx: any) => {
        try {
          const release_id = RequestData?.id;
          delete RequestData.id;

          const edit_release = {
            date_planing: RequestData?.date_planing,
            date_receive: RequestData?.date_receive,
            dem_free_time: RequestData?.dem_free_time,
            location_do: RequestData?.location_do,
            demurrage_dem_date: RequestData?.demurrage_dem_date,
            detention_det_date: RequestData?.detention_det_date,
            license_plate: RequestData?.license_plate,
            location_exchange: RequestData?.location_exchange,
            phone_number: RequestData?.phone_number,
            terminal_release: RequestData?.terminal_release,
            type_car: RequestData?.type_car,
            employee_driver: RequestData?.employee_driver,
            company_car: RequestData?.company_car,
            det_free_time: RequestData?.det_free_time,
          };

          const contain = await this.csStatusRepository.update(
            tx,
            release_id,
            edit_release,
            "waitrelease"
          );

          if (RequestData?.existingImageIds?.length > 0) {
            const dataRequest: any =
              await this.csStatusRepository.getDatareleasefile(
                tx,
                release_id,
                RequestData.existingImageIds
              );
            console.log(dataRequest, "dataRequest");
            if (dataRequest.length > 0) {
              for (let file of dataRequest) {
                const tempFilePath = file.file_path;
                const newFilePath = path.join(uploadDir, file.file_name);

                await fs.unlinkSync(newFilePath);

                await this.csStatusRepository.delete(
                  tx,
                  file.id,
                  "waitrelease_file"
                );
              }
            }
          }

          if (RequestData?.files?.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                waitrelease_id: release_id,
                file_name: file.filename,
                file_path: `/images/wait_release/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const contain_picture =
                await this.csStatusRepository.createDocument(
                  //คือการอัพเดด ข้อมูล
                  tx,
                  d_image,
                  "waitrelease_file"
                );

              if (contain_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
            }
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
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return contain;
        } catch (err: any) {
          console.log("editeFail", err);
          throw new Error(err);
        }
      });
      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("editeFail", err);
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

      const id = await this.prisma.$transaction(async (tx) => {
        try {
          const cs_purchaseData = {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "Released",
            number_key: 8,
            status_name: "ตรวจปล่อยเรียบร้อย",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );
          const success_release = {
            cs_purchase_id: cs_purchase.id,
            shipping: RequestData.shipping,
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
            }
          }

          const purchase_detail = await this.csService.getPurchaseDetail(
            RequestData.d_purchase_id
          );
          let RequestSentNotifaction = {
            user_id: purchase_detail.d_purchase_emp[0].user_id,
            purchase_id: RequestData.d_purchase_id,
            link_to: `purchase/content/` + RequestData.d_purchase_id,
            title: "CS (ตรวจปล่อยเรียบร้อย)",
            subject_key: RequestData.d_purchase_id,
            message: `Cs ตรวจปล่อยเรียบร้อย เลขที่:${purchase_detail.book_number}`,
            status: false,
            data: {},
          };
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return cs_purchase.id;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateSuccessRelease(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "success_release",
        `${RequestData.d_purchase_id}`
      );
      await fs.mkdirSync(uploadDir, { recursive: true });

      const id = await this.prisma.$transaction(async (tx) => {
        try {
          const success_release = {
            cs_purchase_id: RequestData.cs_purchase_id,
            shipping: RequestData.shipping,
            date_release: RequestData.date_release,
            date_do: RequestData.date_do,
            date_card: RequestData.date_card,
            date_return_document: RequestData.date_return_document,
            date_return_docu: RequestData.date_return_docu,
          };

          const success_release_update = await this.csStatusRepository.update(
            tx,
            RequestData.id,
            success_release,
            "cs_inspection"
          );

          if (RequestData?.existingImageIds?.length > 0) {
            const dataRequest: any =
              await this.csStatusRepository.getDatasuccessreleasefile(
                tx,
                RequestData.id,
                RequestData.existingImageIds
              );
            if (dataRequest.length > 0) {
              for (let file of dataRequest) {
                const tempFilePath = file.file_path;
                const newFilePath = path.join(uploadDir, file.file_name);

                await fs.unlinkSync(newFilePath);

                await this.csStatusRepository.delete(
                  tx,
                  file.id,
                  "cs_inspection_file"
                );
              }
            }
          }

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;
              const d_image = {
                cs_inspection_id: success_release_update.id,
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
            }
          }

          const purchase_detail = await this.csService.getPurchaseDetail(
            RequestData.d_purchase_id
          );
          let RequestSentNotifaction = {
            user_id: purchase_detail.d_purchase_emp[0].user_id,
            purchase_id: RequestData.d_purchase_id,
            link_to: `purchase/content/` + RequestData.d_purchase_id,
            title: "CS (ตรวจปล่อยเรียบร้อย)",
            subject_key: RequestData.d_purchase_id,
            message: `Cs ตรวจปล่อยเรียบร้อย เลขที่:${purchase_detail.book_number}`,
            status: false,
            data: {},
          };
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return true;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createDestination(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "destination",
        `${RequestData.d_purchase_id}`
      );
      await fs.mkdirSync(uploadDir, { recursive: true });

      const id = await this.prisma.$transaction(async (tx) => {
        try {
          const cs_purchaseData = {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "Destination",
            number_key: 9,
            status_name: "จัดส่งปลายทาง",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );

          const re: any = await tx.cs_purchase.findFirst({
            select: {
              id: true,
            },
            where: {
              d_purchase_id: RequestData.d_purchase_id,
              status_key: "WaitRelease",
            },
          });

          const getData: any = await tx.waitrelease.findFirst({
            where: {
              cs_purchase_id: re.id,
            },
          });

          const create_release = {
            cs_purchase_id: cs_purchase.id,
            waitrelease_id: getData.id,
            date_receiving_cabinet: RequestData.date_receiving_cabinet,
          };

          const document = await this.csStatusRepository.create(
            tx,
            create_release,
            "cs_wait_destination"
          );

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                wait_destination_id: document.id,
                file_name: file.filename,
                file_path: `/images/destination/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const document_picture =
                await this.csStatusRepository.createDocument(
                  tx,
                  d_image,
                  "cs_wait_destination_file"
                );

              if (document_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
            }
            const purchase_detail = await this.csService.getPurchaseDetail(
              RequestData.d_purchase_id
            );
            let RequestSentNotifaction = {
              user_id: purchase_detail.d_purchase_emp[0].user_id,
              purchase_id: RequestData.d_purchase_id,
              link_to: `purchase/content/` + RequestData.d_purchase_id,
              title: "CS (จัดส่งปลายทาง)",
              subject_key: RequestData.d_purchase_id,
              message: `Cs จัดส่งปลายทาง เลขที่:${purchase_detail.book_number}`,
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
          return cs_purchase.id;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateDestination(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "destination",
        `${RequestData.d_purchase_id}`
      );
      await fs.mkdirSync(uploadDir, { recursive: true });

      const id = await this.prisma.$transaction(async (tx) => {
        try {
          const re: any = await tx.cs_purchase.findFirst({
            select: {
              id: true,
            },
            where: {
              d_purchase_id: RequestData.d_purchase_id,
              status_key: "WaitRelease",
            },
          });

          const getData: any = await tx.waitrelease.findFirst({
            where: {
              cs_purchase_id: re.id,
            },
          });

          const create_release = {
            date_receiving_cabinet: RequestData.date_receiving_cabinet,
          };

          console.log("RequestData", RequestData);

          const contain = await this.csStatusRepository.update(
            tx,
            RequestData.id,
            create_release,
            "cs_wait_destination"
          );

          if (RequestData.existingImageIds.length > 0) {
            const dataRequest: any =
              await this.csStatusRepository.getWaitDestinationFile(
                tx,
                RequestData.id,
                RequestData.existingImageIds
              );

            if (dataRequest.length > 0) {
              for (let file of dataRequest) {
                const tempFilePath = file.file_path;
                const newFilePath = path.join(uploadDir, file.file_name);
                await fs.unlinkSync(newFilePath);

                await this.csStatusRepository.delete(
                  tx,
                  file.id,
                  "cs_wait_destination_file"
                );
              }
            }
          }

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                wait_destination_id: contain.id,
                file_name: file.filename,
                file_path: `/images/destination/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const document_picture =
                await this.csStatusRepository.createDocument(
                  tx,
                  d_image,
                  "cs_wait_destination_file"
                );

              if (document_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
            }
          }

          const purchase_detail = await this.csService.getPurchaseDetail(
            RequestData.d_purchase_id
          );

          let RequestSentNotifaction = {
            user_id: purchase_detail.d_purchase_emp[0].user_id,
            purchase_id: RequestData.d_purchase_id,
            link_to: `purchase/content/` + RequestData.d_purchase_id,
            title: "CS (จัดส่งปลายทาง)",
            subject_key: RequestData.d_purchase_id,
            message: `Cs จัดส่งปลายทาง เลขที่:${purchase_detail.book_number}`,
            status: false,
            data: {},
          };
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );
        } catch (err: any) {
          throw new Error(err);
        }
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createSentSuccess(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "sent_success",
        `${RequestData.d_purchase_id}`
      );
      await fs.mkdirSync(uploadDir, { recursive: true });

      const id = await this.prisma.$transaction(async (tx) => {
        try {
          const cs_purchaseData = {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "SentSuccess",
            number_key: 10,
            status_name: "ส่งเรียบร้อย",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );

          console.log("cs_purchase", cs_purchase);

          const create_release = {
            cs_purchase_id: cs_purchase.id,
            date_out_arrival: RequestData.date_out_arrival,
            etc: RequestData.etc,
          };

          const cs_already_sent = await this.csStatusRepository.create(
            tx,
            create_release,
            "cs_already_sent"
          );

          console.log("cs_already_sent", cs_already_sent);

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                cs_already_sent_id: cs_already_sent.id,
                file_name: file.filename,
                file_path: `/images/sent_success/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const document_picture =
                await this.csStatusRepository.createDocument(
                  tx,
                  d_image,
                  "cs_already_sent_file"
                );

              if (document_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
            }
            const purchase_detail = await this.csService.getPurchaseDetail(
              RequestData.d_purchase_id
            );
            let RequestSentNotifaction = {
              user_id: purchase_detail.d_purchase_emp[0].user_id,
              purchase_id: RequestData.d_purchase_id,
              link_to: `purchase/content/` + RequestData.d_purchase_id,
              title: "CS (ส่งเรียบร้อย)",
              subject_key: RequestData.d_purchase_id,
              message: `Cs ส่งเรียบร้อย เลขที่:${purchase_detail.book_number}`,
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
          return cs_purchase.id;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        message: "บันทึกข้อมูลสำเร็จ",
        id: id,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateSentSuccess(RequestData: Partial<any>): Promise<any> {
    try {
      const id = RequestData.id;
      delete RequestData.id;
      const uploadDir = path.join(
        "public",
        "images",
        "sent_success",
        `${RequestData.d_purchase_id}`
      );
      await fs.mkdirSync(uploadDir, { recursive: true });

      const datas = await this.prisma.$transaction(async (tx) => {
        try {
          const create_release = {
            date_out_arrival: RequestData.date_out_arrival,
            etc: RequestData.etc,
          };

          const contain = await this.csStatusRepository.update(
            tx,
            id,
            create_release,
            "cs_already_sent"
          );

          // if (RequestData.existingImageIds.length > 0) {
          //   const dataRequest: any =
          //     await this.csStatusRepository.getSentSuccessFile(
          //       tx,
          //       RequestData.id,
          //       RequestData.existingImageIds
          //     );

          //   if (dataRequest.length > 0) {
          //     for (let file of dataRequest) {
          //       const tempFilePath = file.file_path;
          //       const newFilePath = path.join(uploadDir, file.file_name);
          //       await fs.unlinkSync(newFilePath);

          //       await this.csStatusRepository.delete(
          //         tx,
          //         file.id,
          //         "cs_already_sent_file"
          //       );
          //     }
          //   }
          // }

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                cs_already_sent_id: contain.id,
                file_name: file.filename,
                file_path: `/images/sent_success/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const document_picture =
                await this.csStatusRepository.createDocument(
                  tx,
                  d_image,
                  "cs_already_sent_file"
                );

              if (document_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
            }
          }

          const purchase_detail = await this.csService.getPurchaseDetail(
            RequestData.d_purchase_id
          );
          let RequestSentNotifaction = {
            user_id: purchase_detail.d_purchase_emp[0].user_id,
            purchase_id: RequestData.d_purchase_id,
            link_to: `purchase/content/` + RequestData.d_purchase_id,
            title: "CS (ส่งเรียบร้อย)",
            subject_key: RequestData.d_purchase_id,
            message: `Cs ส่งเรียบร้อย เลขที่:${purchase_detail.book_number}`,
            status: false,
            data: {},
          };
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );
          return contain;
        } catch (err: any) {
          throw new Error(err);
        }
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createReturn(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "return_cabinet",
        `${RequestData.d_purchase_id}`
      );
      await fs.mkdirSync(uploadDir, { recursive: true });

      const id = await this.prisma.$transaction(async (tx) => {
        try {
          const cs_purchaseData = {
            d_purchase_id: RequestData.d_purchase_id,
            status_key: "return_cabinet",
            number_key: 11,
            status_name: "คืนตู้",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );

          console.log("cs_purchase", cs_purchase);

          const create_return = {
            cs_purchase_id: cs_purchase.id,
            date_return_cabinet: RequestData?.date_return_cabinet,
            cabinet: RequestData?.cabinet === "false" ? false : true,
            date_cabinet: RequestData?.date_cabinet,
            price_repair_cabinet: RequestData?.price_repair_cabinet,
            request_return:
              RequestData?.request_return === "false" ? false : true,
            date_request_return: RequestData?.date_request_return,
            price_request_return: RequestData?.price_request_return,
            return_cabinet:
              RequestData?.return_cabinet === "false" ? false : true,
            price_deposit: RequestData?.price_deposit,
            price_return_cabinet: RequestData?.price_return_cabinet,
          };
          console.log("create_return", create_return);

          const cs_already_sent = await this.csStatusRepository.create(
            tx,
            create_return,
            "cs_return_cabinet"
          );

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                return_cabinet_id: cs_already_sent.id,
                file_name: file.filename,
                key: file.fieldname,
                file_path: `/images/return_cabinet/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const document_picture =
                await this.csStatusRepository.createDocument(
                  tx,
                  d_image,
                  "cs_return_cabinet_file"
                );

              if (document_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
            }
            const purchase_detail = await this.csService.getPurchaseDetail(
              RequestData.d_purchase_id
            );
            let RequestSentNotifaction = {
              user_id: purchase_detail.d_purchase_emp[0].user_id,
              purchase_id: RequestData.d_purchase_id,
              link_to: `purchase/content/` + RequestData.d_purchase_id,
              title: "CS (คืนตู้)",
              subject_key: RequestData.d_purchase_id,
              message: `Cs คืนตู้ เลขที่:${purchase_detail.book_number}`,
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
          return cs_purchase.id;
        } catch (err: any) {
          console.log("createFail", err);
          throw new Error(err);
        }
      });

      const response = {
        message: "บันทึกข้อมูลสำเร็จ",
        id: id,
        statusCode: 200,
      };
      return response;
    } catch (err: any) {}
  }

  async editReturn(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "return_cabinet",
        `${RequestData.d_purchase_id}`
      );

      await fs.mkdirSync(uploadDir, { recursive: true });

      const id = await this.prisma.$transaction(async (tx) => {
        try {
          const return_id = RequestData?.id;
          delete RequestData.id;

          const create_return = {
            date_return_cabinet: RequestData?.date_return_cabinet,
            cabinet: RequestData?.cabinet === "false" ? false : true,
            date_cabinet: RequestData?.date_cabinet,
            price_repair_cabinet: RequestData?.price_repair_cabinet,
            request_return:
              RequestData?.request_return === "false" ? false : true,
            date_request_return: RequestData?.date_request_return,
            price_request_return: RequestData?.price_request_return,
            return_cabinet:
              RequestData?.return_cabinet === "false" ? false : true,
            price_deposit: RequestData?.price_deposit,
            price_return_cabinet: RequestData?.price_return_cabinet,
          };

          const contain = await this.csStatusRepository.update(
            tx,
            return_id,
            create_return,
            "cs_return_cabinet"
          );

          if (RequestData?.existingImageIds?.length > 0) {
            const dataRequest: any =
              await this.csStatusRepository.getDatareturnfile(
                tx,
                return_id,
                RequestData.existingImageIds
              );
            console.log(dataRequest, "dataRequest");
            if (dataRequest.length > 0) {
              for (let file of dataRequest) {
                const tempFilePath = file.file_path;
                const newFilePath = path.join(uploadDir, file.file_name);

                await fs.unlinkSync(newFilePath);

                await this.csStatusRepository.delete(
                  tx,
                  file.id,
                  "cs_return_cabinet_file"
                );
              }
            }
          }

          // const contain_product = await this.csStatusRepository.createOrupdate(
          //     tx,
          //     JSON.parse(RequestData.items),
          //     id
          //   );

          if (RequestData.files.length > 0) {
            for (let file of RequestData.files) {
              const tempFilePath = file.path;

              const d_image = {
                return_cabinet_id: return_id,
                file_name: file.filename,
                key: file.fieldname,
                file_path: `/images/return_cabinet/${RequestData.d_purchase_id}/${file.filename}`,
              };
              const contain_picture =
                await this.csStatusRepository.createDocument(
                  tx,
                  d_image,
                  "cs_return_cabinet_file"
                );

              if (contain_picture) {
                const newFilePath = path.join(uploadDir, file.filename);
                await fs.renameSync(tempFilePath, newFilePath);
              }
            }
          }
          const purchase_detail = await this.csService.getPurchaseDetail(
            RequestData.d_purchase_id
          );
          let RequestSentNotifaction = {
            user_id: purchase_detail.d_purchase_emp[0].user_id,
            purchase_id: RequestData.d_purchase_id,
            link_to: `purchase/content/` + RequestData.d_purchase_id,
            title: "CS (คืนตู้)",
            subject_key: RequestData.d_purchase_id,
            message: `Cs คืนตู้ เลขที่:${purchase_detail.book_number}`,
            status: false,
            data: {},
          };
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return contain;
        } catch (err: any) {
          console.log("editeFail", err);
          throw new Error(err);
        }
      });
      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("editeFail", err);
      throw new Error(err);
    }
  }

  async getEtc(id: any): Promise<any> {
    try {
      const data = await this.csStatusRepository.getEtc(id);
      const response = {
        data: data,
        statusCode: 200,
      };
      return response;
      return data;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createEtc(data: any): Promise<any> {
    try {
      const id = await this.prisma.$transaction(async (tx: any) => {
        try {
          const cs_purchaseData = {
            d_purchase_id: data.d_purchase_id,
            status_key: "Etc",
            number_key: 12,
            status_name: "หมายเหตุ",
            status_active: true,
          };

          const cs_purchase = await this.csStatusRepository.createCsPurchase(
            tx,
            cs_purchaseData
          );

          const EtcData = {
            etc: data.etc,
            date_etc: data.date_etc,
            cs_purchase_id: cs_purchase.id,
          };

          const etc = await this.csStatusRepository.createEtc(tx, EtcData);

          const purchase_detail = await this.csService.getPurchaseDetail(
            data.d_purchase_id
          );
          let RequestSentNotifaction = {
            user_id: purchase_detail.d_purchase_emp[0].user_id,
            purchase_id: data.d_purchase_id,
            link_to: `purchase/content/` + data.d_purchase_id,
            title: "CS (หมายเหตุ)",
            subject_key: data.d_purchase_id,
            message: `Cs หมายเหตุ เลขที่:${purchase_detail.book_number}`,
            status: false,
            data: {},
          };
          RequestSentNotifaction.data = JSON.stringify(RequestSentNotifaction);
          const notification = await this.notificationRepo.sendNotification(
            RequestSentNotifaction
          );

          return cs_purchase.id;
        } catch (err: any) {
          throw new Error(err);
        }
      });
      const response = {
        id: id,
        message: "บันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
