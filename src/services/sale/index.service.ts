import { Request, Response } from "express";
import SaleRepository from "../../repository/sale/index.repository";
import path from "path";
import fs from "fs";
import {
  RequestPurchase,
  RequestProductImage,
  RequestProduct,
  Tagstatus,
} from "../../interface/sale.interface";
import { PrismaClient } from "@prisma/client";

import moment from "moment";
import NotificationRepository from "../../repository/notification/index.repository";

class SaleService {
  private saleRepo: SaleRepository;
  private prisma: PrismaClient;
  private notificationRepo: NotificationRepository;

  constructor() {
    this.notificationRepo = new NotificationRepository();
    this.saleRepo = new SaleRepository();
    this.prisma = new PrismaClient();
  }
  async getCustomer(RequestData: Partial<any>): Promise<any> {
    const data = await this.saleRepo.getCustomer(RequestData);
    return data;
  }

  async getCustomerDetail(customerId: string): Promise<any> {
    try {
      const data = await this.saleRepo.getCustomerDetail(customerId);

      let customer_detail: Partial<any> = {};

      customer_detail = data.details;
      delete data.details;
      switch (data.customer_status[0].cus_status) {
        case "สนใจ":
          data.customer_status[0].color = "bg-blue-500";
          break;
        case "ไม่สนใจ":
          data.customer_status[0].color = "bg-red-400";
          break;
        case "ติดตามต่อ":
          data.customer_status[0].color = "bg-orange-300";
          break;
        case "ติดต่อไม่ได้":
          data.customer_status[0].color = "bg-gray-500";
          break;
        case "ปิดการขาย":
          data.customer_status[0].color = "bg-green-400";
          break;
        default:
          data.customer_status[0].color = "bg-blue-500";
      }

      switch (data.cus_etc) {
        case "โทร":
          data.cus_etc_color = "bg-green-400";
          break;
        case "ทัก":
          data.cus_etc_color = "bg-blue-500";
          break;
        case "Walk-in":
          data.cus_etc_color = "bg-gray-300";
          break;
        case "ออกบูธ":
          data.cus_etc_color = "bg-purple-300";
          break;
        default:
          data.cus_etc_color = "bg-blue-500";
      }

      Object.assign(customer_detail, { cus_etc_color: data.cus_etc_color });
      Object.assign(customer_detail, {
        cus_status: data.customer_status[0].cus_status,
      });
      Object.assign(customer_detail, { color: data.customer_status[0].color });
      delete data.customer_status;
      Object.assign(customer_detail, data);

      return customer_detail;
    } catch (err: any) {
      throw err;
    }
  }

  async createCustomer(RequestData: Partial<any>): Promise<any> {
    try {
      const response = await this.saleRepo.createCustomer(RequestData);
      return response;
    } catch (err: any) {
      throw err;
    }
  }

  async editCustomer(RequestData: Partial<any>): Promise<any> {
    try {
      const response = await this.saleRepo.editCustomer(RequestData);
      return response;
    } catch (err: any) {
      throw err;
    }
  }

  async changeTagStatus(RequestData: Partial<any>): Promise<any> {
    try {
      const statusString: Tagstatus = RequestData.status;
      let status: Tagstatus | undefined;

      if (Object.values(Tagstatus).includes(statusString)) {
        status = statusString as Tagstatus;
      } else {
        return {
          message: "Invalid status value",
        };
      }
      const response = await this.saleRepo.changeTagStatus(RequestData);
      return response;
    } catch (err: any) {
      throw err;
    }
  }

  async getAllEstimate(RequestData: any): Promise<any> {
    try {
      let PurchaseData = await this.saleRepo.getAllEstimate(RequestData);
      const employee = await this.saleRepo.getEmployee(RequestData.userId);
      PurchaseData.employee = employee;
      return PurchaseData;
    } catch (err: any) {
      throw err;
    }
  }

  async getEstimate(purchaseId: string): Promise<any> {
    try {
      const data = await this.saleRepo.getEstimate(purchaseId);

      let response: Partial<any> = {};
      if (data == null) {
        const today = moment().format("YYYY-MM-DD");
        const existingBookNumber = await this.prisma.d_purchase.findFirst({
          where: {
            book_number: {
              startsWith: `PO${today}-`,
            },
          },
          orderBy: {
            book_number: "desc",
          },
        });
        const bookNumberPrefix = `PO${today}-`;
        let nextNumber = 1;
        if (existingBookNumber) {
          const currentNumber = parseInt(
            existingBookNumber.book_number.replace(bookNumberPrefix, ""),
            10
          );
          nextNumber = currentNumber + 1;
        }

        const formattedNumber = nextNumber.toString().padStart(4, "0");
        response.book_number = `PO${today}-${formattedNumber}`;
      } else {
        response = data;
      }

      return response;
    } catch (err: any) {
      throw err;
    }
  }

  async cancelEstimate(RequestData: Partial<any>): Promise<any> {
    try {
      const response = await this.saleRepo.cancelEstimate(RequestData);
      return response;
    } catch (err: any) {
      throw err;
    }
  }

  async getCheckBooking(): Promise<any> {
    //เช็ค Booking +1 ถ้าไม่ให้เริ่มใหม่ต่อวัน
    try {
      const today = moment().format("YYYY-MM-DD");
      let response: Partial<any> = {};
      const existingBookNumber = await this.prisma.d_purchase.findFirst({
        where: {
          book_number: {
            startsWith: `PO${today}-`,
          },
        },
        orderBy: {
          book_number: "desc",
        },
      });
      const bookNumberPrefix = `PO${today}-`;
      let nextNumber = 1;
      if (existingBookNumber) {
        const currentNumber = parseInt(
          existingBookNumber.book_number.replace(bookNumberPrefix, ""),
          10
        );
        nextNumber = currentNumber + 1;
      }

      const formattedNumber = nextNumber.toString().padStart(4, "0");
      response.book_number = `PO${today}-${formattedNumber}`;

      return response;
    } catch (err: any) {
      throw new Error(err);
    }
  }


  async submitEstimate(RequestData: Partial<any>): Promise<any> {
    try {
      const d_purchase: RequestPurchase = {
        book_number: RequestData.book_number,
        customer_id: RequestData.customer_id,
        d_route: RequestData.d_route,
        d_transport: RequestData.d_transport,
        d_group_work: RequestData.d_group_work,
        d_term: RequestData.d_term,
        d_origin: RequestData.d_origin,
        d_shipment_number: RequestData.d_shipment_number,
        date_cabinet: RequestData.date_cabinet,
        d_address_destination_la: RequestData.d_address_destination_la,
        d_address_destination_long: RequestData.d_address_destination_long,
        d_address_origin_la: RequestData.d_address_origin_la,
        d_address_origin_long: RequestData.d_address_origin_long,
        d_destination: RequestData.d_destination,
        link_d_origin: RequestData.link_d_origin,
        link_d_destination: RequestData.link_d_destination,
        d_size_cabinet: RequestData.d_size_cabinet,
        d_weight: RequestData.d_weight,
        d_address_origin: RequestData.d_address_origin,
        d_address_destination: RequestData.d_address_destination,
        d_refund_tag: RequestData?.d_refund_tag ? RequestData.d_refund_tag : "",
        d_truck: RequestData.d_truck,
        d_etc: RequestData.d_etc,
        d_status: "Sale ตีราคา",
      };

      await this.prisma.$transaction(async (tx) => {
        try {
          const purchase = await this.saleRepo.submitEstimate(tx, d_purchase);

          if (purchase) {
            const d_product: RequestProduct = {
              d_purchase_id: purchase.id,
              d_product_name: RequestData.d_product,
            };

            await this.saleRepo.ChangeStatus(tx, purchase.id);
            await this.saleRepo.submitPurchaseemployee(
              tx,
              purchase.id,
              RequestData.employee_id
            );

            const purchase_products = await this.saleRepo.submitEstimateProduct(
              tx,
              d_product
            );

            const uploadDir = path.join(
              "public",
              "images",
              "purchase_product",
              `${purchase.id}`
            );
            // Create directories if they don't exist
            await fs.mkdirSync(uploadDir, { recursive: true });

            if (purchase_products) {
              if (RequestData.files.length > 0) {
                for (let file of RequestData.files) {
                  const tempFilePath = file.path;
                  const d_image: RequestProductImage = {
                    d_product_id: purchase_products.id,
                    d_purchase_id: purchase.id,
                    d_product_image_name: file.filename,
                    d_active: true,
                  };
                  const purchase_product_image =
                    await this.saleRepo.submitEstimateProductImage(tx, d_image);

                  if (purchase_product_image) {
                    const newFilePath = path.join(uploadDir, file.filename);
                    console.log("new file path", newFilePath);
                    await fs.renameSync(tempFilePath, newFilePath);
                  }
                }
              }
            }

            const getEmpAllCS = await this.saleRepo.getEmpAllCS();

            for (const emp of getEmpAllCS) {
              const notification = {
                user_id: emp.id,
                link_to: `cs/purchase/content/${purchase.id}`,
                title: "Sale ตีราคา",
                subject_key: purchase.id,
                message: `Sale ตีราคา เลขที่:${purchase.book_number}`,
                status: false,
                data: {},
              };
              notification.data = JSON.stringify(notification);
              const dataNotification =
                await this.notificationRepo.sendNotification(notification);
            }
          }
        } catch (error) {
          throw error;
        }
      });

      const response = {
        message: "บัันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("errservice", err);
      throw err;
    }
  }

  async updateEstimate(RequestData: Partial<any>): Promise<any> {
    try {
      const d_purchase: RequestPurchase = {
        book_number: RequestData.book_number,
        customer_id: RequestData.customer_id,
        d_route: RequestData.d_route,
        d_transport: RequestData.d_transport,
        d_group_work: RequestData.d_group_work,
        link_d_destination: RequestData.link_d_destination,
        link_d_origin: RequestData.link_d_origin,
        date_cabinet: RequestData.date_cabinet,
        d_term: RequestData.d_term,
        d_origin: RequestData.d_origin,
        d_address_destination_la: RequestData.d_address_destination_la,
        d_address_destination_long: RequestData.d_address_destination_long,
        d_address_origin_la: RequestData.d_address_origin_la,
        d_address_origin_long: RequestData.d_address_origin_long,
        d_destination: RequestData.d_destination,
        d_size_cabinet: RequestData.d_size_cabinet,
        d_weight: RequestData.d_weight,
        d_address_origin: RequestData.d_address_origin,
        d_address_destination: RequestData.d_address_destination,
        d_refund_tag: RequestData.d_refund_tag,
        d_truck: RequestData.d_truck,
        d_etc: RequestData.d_etc,
      };

      await this.prisma.$transaction(async (tx) => {
        try {
          const purchase = await this.saleRepo.updateEstimate(
            tx,
            RequestData.id,
            d_purchase
          );

          if (purchase) {
            const d_product: RequestProduct = {
              d_product_name: RequestData.d_product,
            };

            const purchase_products = await this.saleRepo.updateEstimateProduct(
              tx,
              RequestData.id,
              d_product
            );

            if (RequestData.files.length > 0) {
              const uploadDir = path.join(
                "public",
                "images",
                "purchase_product",
                `${purchase.id}`
              );
              await fs.mkdirSync(uploadDir, { recursive: true });

              const checkEdit = await this.saleRepo.checkEdit(
                tx,
                RequestData.id,
                RequestData.existingImageIds
              );

              const getImage = await this.saleRepo.getImageName(
                tx,
                RequestData.id
              );

              for (let image of getImage) {
                if (!checkEdit.find((item: any) => item.id === image.id)) {
                  const filePath = path.join(
                    uploadDir,
                    image.d_product_image_name
                  );
                  await fs.unlinkSync(filePath);
                }

                await this.saleRepo.deleteImage(tx, image.id);
              }

              if (purchase_products) {
                if (RequestData.files.length > 0) {
                  for (let file of RequestData.files) {
                    const tempFilePath = file.path;
                    const d_image: RequestProductImage = {
                      d_product_id: purchase_products.id,
                      d_purchase_id: purchase.id,
                      d_product_image_name: file.filename,
                      d_active: true,
                    };
                    const purchase_product_image =
                      await this.saleRepo.submitEstimateProductImage(
                        tx,
                        d_image
                      );

                    if (purchase_product_image) {
                      const newFilePath = path.join(uploadDir, file.filename);
                      console.log("new file path", newFilePath);
                      await fs.renameSync(tempFilePath, newFilePath);
                    }
                  }
                }
              }
            }
          }
        } catch (err: any) {
          console.log("erddfdfdfr", err);
          throw err;
        }
      });
      const response = {
        message: "บัันทึกข้อมูลสำเร็จ",
        statusCode: 200,
      };
      return response;
    } catch (err: any) {
      console.log("errsdfsdfsd", err);
      throw err;
    }
  }

  async applyEmployee(RequestData: Partial<any>): Promise<any> {
    try {
      const updateEmployee = await this.saleRepo.applyEmployee(RequestData);
      return updateEmployee;
    } catch (err: any) {
      throw err;
    }
  }

  async acceptJob(id: string, RequestData: Partial<any>): Promise<any> {
    try {
      const updateEmployee = await this.saleRepo.acceptJob(id, RequestData);
      return updateEmployee;
    } catch (err: any) {
      throw err;
    }
  }

  async cancelJob(id: string, user_id: string): Promise<any> {
    try {
      const updateEmployee = await this.saleRepo.cancelJob(id, user_id);
      return updateEmployee;
    } catch (err: any) {
      throw err;
    }
  }
  async updateDocument(RequestData: Partial<any>): Promise<any> {
    try {
      const uploadDir = path.join(
        "public",
        "images",
        "document",
        `${RequestData.purchase_id}`
      );
      for (let item of RequestData.files) {
        console.log("item", item);

        const newFilePath = path.join(uploadDir, item.filename);
        console.log("new file path", newFilePath);

        const tempFilePath = item.path;

        // Create the directory for the new file if it doesn't exist
        const newFileDir = path.dirname(newFilePath);
        await fs.mkdirSync(newFileDir, { recursive: true });

        // Rename (move) the file using the asynchronous rename function
        await fs.renameSync(tempFilePath, newFilePath);

        console.log("items ", item);

        const documentImage = {
          d_document_id: item.fieldname,
          file_name: item.filename,
          file_path: `/images/document/${RequestData.purchase_id}/${item.filename}`,
        };

        const Document_Image = await this.saleRepo.submitEstimateDocumentfile(
          documentImage
        );
      }
      const getPurchaseByid = await this.saleRepo.getEstimate(
        RequestData.purchase_id
      );

      if (getPurchaseByid) {
        const d_purchase = {
          d_status: "Sale แนบเอกสาร",
        };

        await this.prisma.$transaction(async (tx) => {
          try {
            const purchase = await this.saleRepo.ChangePurchaseStatus(
              tx,
              RequestData.purchase_id,
              "Send_document",
              "Sale แนบเอกสาร"
            );

            const notification = {
              user_id: purchase.d_emp_look,
              link_to: `cs/purchase/content/${purchase.id}`,
              title: "Sale แนบเอกสาร",
              subject_key: purchase.id,
              message: `Sale แนบเอกสาร เลขที่:${purchase.book_number}`,
              status: false,
              data: {},
            };

            notification.data = JSON.stringify(notification);
            const dataNotification =
              await this.notificationRepo.sendNotification(notification);
          } catch (err: any) {
            throw err;
          }
        });
      }

      // const response = await this.saleRepo.updateDocument(RequestData);
      return true;
    } catch (err: any) {
      throw err;
    }
  }

  async submitAddorderPurchase(RequestData: Partial<any>): Promise<any> {
    try {
      await this.prisma.$transaction(async (tx) => {
        try {
          const checkAgentcy = await tx.d_sale_agentcy.findMany({
            where: {
              d_purchase_id: RequestData.d_purchase_id,
              status: true,
            },
          });

          if (checkAgentcy.length > 0) {
            await tx.d_sale_agentcy.updateMany({
              where: {
                d_purchase_id: RequestData.d_purchase_id,
              },
              data: {
                status: false,
              },
            });
          }

          const d_sale_agentcy: any = {
            d_purchase_id: RequestData.d_purchase_id,
            d_agentcy_id: RequestData.d_agentcy_id,
            status: true,
          };
          const createPurchase = await this.saleRepo.submitAddorderPurchase(
            tx,
            d_sale_agentcy
          );
          const uploadDir = path.join(
            "public",
            "images",
            "purchase",
            `${RequestData.d_purchase_id}`
          );
          // Create directories if they don't exist
          await fs.mkdirSync(uploadDir, { recursive: true });
          for (let files of RequestData.files) {
            const newFilePath = path.join(uploadDir, files.filename);
            const tempFilePath = files.path;
            await fs.renameSync(tempFilePath, newFilePath);

            const dataRequest = {
              d_purchase_id: RequestData.d_purchase_id,
              d_agentcy_id: RequestData.d_agentcy_id,
              file_name: files.filename,
              file_path: `/images/purchase/${RequestData.purchase_id}/${files.filename}`,
            };

            const data = await tx.d_sale_agentcy.findUnique({
              where: { id: createPurchase.id },
              select: {
                id: true,
              },
            });
            await tx.d_sale_agentcy_file.create({
              data: {
                d_purchase_id: dataRequest.d_purchase_id,
                d_sale_agent_id: createPurchase.id,
                file_name: dataRequest.file_name,
                file_path: dataRequest.file_path,
              },
            });
          }
        } catch (err: any) {
          throw err;
        }
      });
      return true;
    } catch (err: any) {
      throw err;
    }
  }

  async updatestatusPurchase(RequestData: Partial<any>): Promise<any> {
    try {
      await this.prisma.$transaction(async (tx) => {
        try {
          const purchase = await this.saleRepo.ChangePurchaseStatus(
            tx,
            RequestData.purchase_id,
            "Financial",
            "อยู่ระหว่างทำ Financial"
          );

          const purchase_detail = await this.saleRepo.getEstimate(
            RequestData.purchase_id
          );
          const notification = {
            user_id: purchase_detail.d_emp_look,
            link_to: `cs/purchase/content/${purchase_detail.id}`,
            title: "อยู่ระหว่างทำ Financial",
            subject_key: purchase_detail.id,
            message: `อยู่ระหว่างทำ Financial เลขที่:${purchase_detail.book_number}`,
            status: false,
            data: {},
          };

          notification.data = JSON.stringify(notification);
          const dataNotification = await this.notificationRepo.sendNotification(
            notification
          );
        } catch (err: any) {
          throw err;
        }
      });
      return true;
    } catch (err: any) {
      throw err;
    }
  }

  async submitpayment(RequestData: Partial<any>): Promise<any> {
    //service
    try {
      await this.prisma.$transaction(async (tx) => {
        try {
          const purchase_detail = await this.saleRepo.getEstimate(
            RequestData.d_purchase_id
          );

          const update_purchase = await tx.d_purchase.update({
            where: {
              id: RequestData.d_purchase_id,
              // book_number: purchase_detail.book_number,
            },
            data: {
              d_status: RequestData.purchase_status,
              d_purchase_ref: RequestData.purchase_ref,
            },
          });

          if (update_purchase) {
            if (RequestData.purchase_status === "ปิดการขาย") {
              const status = await this.saleRepo.ChangePurchaseStatus(
                tx,
                RequestData.d_purchase_id,
                "Close",
                "ปิดการขาย"
              );
            } else if (RequestData.purchase_status === "ค้างชำระเงิน") {
              const status = await this.saleRepo.ChangePurchaseStatus(
                tx,
                RequestData.d_purchase_id,
                "Overduepayment",
                "ค้างชำระเงิน"
              );
            } else if (RequestData.purchase_status === "ลูกค้าเครดิต") {
              const status = await this.saleRepo.ChangePurchaseStatus(
                tx,
                RequestData.d_purchase_id,
                "Credit",
                "ลูกค้าเครดิต"
              );
            }
          }

          if (
            RequestData.purchaseFiles.length > 0 ||
            RequestData.conditionFiles.length > 0 ||
            RequestData.purchaseEtcFiles.length > 0
          ) {
            const uploadDir = path.join(
              "public",
              "images",
              "confirm_purchase",
              `${RequestData.d_purchase_id}`
            );
            // Create directories if they don't exist

            await fs.mkdir(uploadDir, { recursive: true }, (err) => {
              if (err) {
                console.error("Error creating directory:", err);
                // Handle the error appropriately
              } else {
                // Continue with file moving logic
              }
            });

            if (RequestData.purchaseFiles.length > 0) {
              const purchase_file = await tx.d_confirm_purchase.create({
                data: {
                  d_purchase_id: RequestData.d_purchase_id,
                  type_confirm: "purchase_file",
                },
              });
              for (let files of RequestData.purchaseFiles) {
                const newFilePath = path.join(uploadDir, files.filename);
                const tempFilePath = files.path;

                await fs.renameSync(tempFilePath, newFilePath);
                const dataRequest = {
                  file_name: files.filename,
                  file_path: `/images/confirm_purchase/${RequestData.d_purchase_id}/${files.filename}`,
                };

                await tx.d_confirm_purchase_file.create({
                  data: {
                    d_confirm_id: purchase_file.id,
                    file_name: dataRequest.file_name,
                    file_path: dataRequest.file_path,
                  },
                });
              }
            }

            if (RequestData.conditionFiles.length > 0) {
              const purchase_file = await tx.d_confirm_purchase.create({
                data: {
                  d_purchase_id: RequestData.d_purchase_id,
                  type_confirm: "condition",
                },
              });
              for (let files of RequestData.conditionFiles) {
                const newFilePath = path.join(uploadDir, files.filename);
                const tempFilePath = files.path;
                await fs.renameSync(tempFilePath, newFilePath);

                const dataRequest = {
                  file_name: files.filename,
                  file_path: `/images/confirm_purchase/${RequestData.d_purchase_id}/${files.filename}`,
                };

                await tx.d_confirm_purchase_file.create({
                  data: {
                    d_confirm_id: purchase_file.id,
                    file_name: dataRequest.file_name,
                    file_path: dataRequest.file_path,
                  },
                });
              }
            }

            if (RequestData.purchaseEtcFiles.length > 0) {
              const purchase_file = await tx.d_confirm_purchase.create({
                data: {
                  d_purchase_id: RequestData.d_purchase_id,
                  type_confirm: "purchase_etc",
                },
              });
              for (let files of RequestData.purchaseEtcFiles) {
                const newFilePath = path.join(uploadDir, files.filename);
                const tempFilePath = files.path;
                await fs.renameSync(tempFilePath, newFilePath);

                const dataRequest = {
                  file_name: files.filename,
                  file_path: `/images/confirm_purchase/${RequestData.d_purchase_id}/${files.filename}`,
                };

                await tx.d_confirm_purchase_file.create({
                  data: {
                    d_confirm_id: purchase_file.id,
                    file_name: dataRequest.file_name,
                    file_path: dataRequest.file_path,
                  },
                });
              }
            }
          }

          const type = JSON.parse(RequestData.type);

          for (let item of type) {
            if (RequestData.typeImage.length > 0) {
              const uploadDir = path.join(
                "public",
                "images",
                "payment",
                `${RequestData.d_purchase_id}`
              );
              await fs.mkdirSync(uploadDir, { recursive: true });

              for (let files of RequestData.typeImage) {
                const newFilePath = path.join(uploadDir, files.filename);
                const tempFilePath = files.path;
                await fs.renameSync(tempFilePath, newFilePath);
                const dataRequest = {
                  file_name: files.filename,
                  file_path: `/images/payment/${RequestData.d_purchase_id}/${files.filename}`,
                };
                await tx.d_purchase_customer_payment.create({
                  data: {
                    d_purchase_id: RequestData.d_purchase_id,
                    payment_image_name: files.filename,
                    payment_path: dataRequest.file_path,
                    payment_date: new Date(),
                    payment_name: item.type_payment,
                    payment_price: item.price,
                    payment_type: item.currency,
                  },
                });
              }
            }
          }

          const Notification = {
            user_id: purchase_detail.d_emp_look,
            purchase_id: RequestData.d_purchase_id,
            link_to: `purchase/content/` + RequestData.d_purchase_id,
            title: "อนุมัติราคา มีปรับสถานะ " + RequestData.purchase_status,
            subject_key: RequestData.d_purchase_id,
            message: `อนุมัติราคา มีปรับสถานะ เลขที่:${purchase_detail.book_number}`,
            status: false,
            data: {},
          };
          Notification.data = JSON.stringify(Notification);
          const dataNotification = await this.notificationRepo.sendNotification(
            Notification
          );
        } catch (err: any) {
          throw err;
        }
      });
      return true;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}

export default SaleService;
