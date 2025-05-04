import { Request, Response } from "express";
import { TransactionCreateDto, TransactionUpdateDto } from "../../services/finance/dto/transaction.interface";
import { ConsignmentCreateDto } from "../../services/finance/dto/consignment.interface";
import z from "zod";
import upload from "../../config/multerConfig";
import multer from "multer";
import prisma from "../../lib/prisma";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

export class TransactionController {
    constructor() {
        // ไม่ต้องสร้าง PrismaClient ใหม่ เพราะเราใช้ singleton จาก lib/prisma.ts
    }

    public async createTransaction(req: Request, res: Response) {
        try {
           

                try {
                    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
                    const data: any = req.body;

                    // ตัวแปรสำหรับเก็บ URL ของไฟล์ที่อัปโหลด
                    let mainTransferSlipUrl = null;
                    let customerDepositTransferSlipUrl = null;
                    let exchangeTransferSlipUrl = null;

                    // ถ้ามีไฟล์หลักให้บันทึกไฟล์
                    if (files && files['file'] && files['file'][0]) {
                        const file = files['file'][0];
                        // สร้างชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำกัน
                        const fileName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
                        const uploadPath = path.join('public/images/transferSlip', fileName);

                        // บันทึกไฟล์
                        fs.renameSync(file.path, uploadPath);

                        // กำหนด URL สำหรับไฟล์
                        mainTransferSlipUrl = `/images/transferSlip/${fileName}`;
                        console.log('Main file uploaded, transferSlipUrl set to:', mainTransferSlipUrl);
                    }

                    // ถ้ามีไฟล์ลูกค้าฝากชำระให้บันทึกไฟล์
                    if (files && files['customerDepositFile'] && files['customerDepositFile'][0]) {
                        const file = files['customerDepositFile'][0];
                        // สร้างชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำกัน
                        const fileName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
                        const uploadPath = path.join('public/images/transferSlip', fileName);

                        // บันทึกไฟล์
                        fs.renameSync(file.path, uploadPath);

                        // กำหนด URL สำหรับไฟล์
                        customerDepositTransferSlipUrl = `/images/transferSlip/${fileName}`;
                        console.log('Customer deposit file uploaded, transferSlipUrl set to:', customerDepositTransferSlipUrl);
                    }

                    // ถ้ามีไฟล์การโอนให้บันทึกไฟล์
                    if (files && files['exchangeFile'] && files['exchangeFile'][0]) {
                        const file = files['exchangeFile'][0];
                        // สร้างชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำกัน
                        const fileName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
                        const uploadPath = path.join('public/images/transferSlip', fileName);

                        // บันทึกไฟล์
                        fs.renameSync(file.path, uploadPath);

                        // กำหนด URL สำหรับไฟล์
                        exchangeTransferSlipUrl = `/images/transferSlip/${fileName}`;
                        console.log('Exchange file uploaded, transferSlipUrl set to:', exchangeTransferSlipUrl);
                    }

                    console.log("Form data keys:", Object.keys(data));

                    // กำหนด interface สำหรับข้อมูล
                    interface CustomerDepositData {
                        amountRMB?: string | number;
                        exchangeRate?: string | number;
                        fee?: string | number;
                        amount?: string | number;
                        vat?: string | number;
                        totalWithVat?: string | number;
                        transferDate?: string;
                        receivingAccount?: string;
                        notes?: string;
                        transferSlipUrl?: string;
                        exchangeRateProfit?: string | number;
                        incomePerTransaction?: string | number;
                        totalDepositAmount?: string | number;
                        includeVat?: boolean | string;
                        priceDifference?: string | number;
                        [key: string]: any; // เพิ่ม index signature เพื่อให้สามารถใช้ dynamic key ได้
                    }

                    interface ExchangeData {
                        amountRMB?: string | number;
                        priceDifference?: string | number;
                        exchangeRate?: string | number;
                        fee?: string | number;
                        amount?: string | number;
                        vat?: string | number;
                        totalWithVat?: string | number;
                        transferDate?: string;
                        receivingAccount?: string;
                        notes?: string;
                        transferSlipUrl?: string;
                        exchangeRateProfit?: string | number;
                        incomePerTransaction?: string | number;
                        [key: string]: any; // เพิ่ม index signature เพื่อให้สามารถใช้ dynamic key ได้
                    }

                    // แปลงข้อมูล customerDeposit จาก dot notation
                    let customerDepositData: CustomerDepositData = {};

                    // ตรวจสอบว่ามีข้อมูล customerDeposit หรือไม่
                    const customerDepositKeys = Object.keys(data).filter(key => key.startsWith('customerDeposit.'));
                    console.log("customerDeposit keys:", customerDepositKeys);

                    if (customerDepositKeys.length > 0) {
                        // มีข้อมูล customerDeposit ในรูปแบบ dot notation
                        customerDepositKeys.forEach(key => {
                            const fieldName = key.replace('customerDeposit.', '');
                            customerDepositData[fieldName as keyof CustomerDepositData] = data[key];
                        });
                        console.log("customerDepositData from dot notation:", customerDepositData);
                    } else if (data.customerDeposit) {
                        // กรณีที่ข้อมูลอยู่ในรูปแบบ Object
                        try {
                            if (typeof data.customerDeposit === 'string') {
                                customerDepositData = JSON.parse(data.customerDeposit);
                            } else {
                                // ใช้วิธีการที่หลากหลายเพื่อแปลง [Object: null prototype] เป็น Object ปกติ
                                try {
                                    customerDepositData = JSON.parse(JSON.stringify(data.customerDeposit));
                                } catch (e) {
                                    try {
                                        customerDepositData = Object.fromEntries(Object.entries(data.customerDeposit));
                                    } catch (e2) {
                                        customerDepositData = Object.assign({}, data.customerDeposit);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Error parsing customerDeposit:", error);
                        }
                    }

                    console.log("Final customerDepositData:", customerDepositData);

                    // แปลงข้อมูล exchange จาก dot notation
                    let exchangeData: ExchangeData = {};

                    // ตรวจสอบว่ามีข้อมูล exchange หรือไม่
                    const exchangeKeys = Object.keys(data).filter(key => key.startsWith('exchange.'));
                    console.log("exchange keys:", exchangeKeys);

                    if (exchangeKeys.length > 0) {
                        // มีข้อมูล exchange ในรูปแบบ dot notation
                        exchangeKeys.forEach(key => {
                            const fieldName = key.replace('exchange.', '');
                            exchangeData[fieldName] = data[key];
                        });
                        console.log("exchangeData from dot notation:", exchangeData);
                    } else if (data.exchange) {
                        // กรณีที่ข้อมูลอยู่ในรูปแบบ Object
                        try {
                            if (typeof data.exchange === 'string') {
                                exchangeData = JSON.parse(data.exchange);
                            } else {
                                // ใช้วิธีการที่หลากหลายเพื่อแปลง [Object: null prototype] เป็น Object ปกติ
                                try {
                                    exchangeData = JSON.parse(JSON.stringify(data.exchange));
                                } catch (e) {
                                    try {
                                        exchangeData = Object.fromEntries(Object.entries(data.exchange));
                                    } catch (e2) {
                                        exchangeData = Object.assign({}, data.exchange);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Error parsing exchange:", error);
                        }
                    }

                    console.log("Final exchangeData:", exchangeData);

                    // ถ้าข้อมูลส่งมาเป็น JSON string ให้แปลงเป็น object
                    if (typeof data.customerDeposit === 'string') {
                        data.customerDeposit = JSON.parse(data.customerDeposit);
                    }

                    if (typeof data.exchange === 'string') {
                        data.exchange = JSON.parse(data.exchange);
                    }

                    // ถ้ามีไฟล์อัพโหลด ให้กำหนด transferSlipUrl
                    if (mainTransferSlipUrl) {
                        data.transferSlipUrl = mainTransferSlipUrl;
                    }

                    // กำหนด URL สำหรับไฟล์ลูกค้าฝากชำระและไฟล์การโอน
                    if (customerDepositTransferSlipUrl && customerDepositData) {
                        customerDepositData.transferSlipUrl = customerDepositTransferSlipUrl;
                    }

                    if (exchangeTransferSlipUrl && exchangeData) {
                        exchangeData.transferSlipUrl = exchangeTransferSlipUrl;
                    }

                    // // Validate required fields
                    // if (!data.type || !data.date || !data.documentNumber || !data.customerId || !data.salesperson) {
                    //     return res.status(400).json({
                    //         message: "กรุณากรอกข้อมูลให้ครบถ้วน",
                    //         statusCode: 400
                    //     });
                    // }

                    let transactionData = null;

                    // Handle customer deposit type
                    if (customerDepositData && Object.keys(customerDepositData).length > 0) {
                        const customerDeposit = await prisma.finance_customer_deposit.create({
                            data: {
                                salespersonId: data.salesperson,
                                documentNumber: data.documentNumber,
                                customerId: data.customerId,
                                amountRMB: customerDepositData.amountRMB ? parseFloat(String(customerDepositData.amountRMB)) : 0,
                                priceDifference: customerDepositData.priceDifference ? parseFloat(String(customerDepositData.priceDifference)) : 0,
                                exchangeRate: customerDepositData.exchangeRate ? parseFloat(String(customerDepositData.exchangeRate)) : 0,
                                fee: customerDepositData.fee ? parseFloat(String(customerDepositData.fee)) : 0,
                                amount: customerDepositData.amount ? parseFloat(String(customerDepositData.amount)) : 0,
                                vat: customerDepositData.vat ? parseFloat(String(customerDepositData.vat)) : 0,
                                totalWithVat: customerDepositData.totalWithVat ? parseFloat(String(customerDepositData.totalWithVat)) : 0,
                                totalDepositAmount: customerDepositData.totalDepositAmount ? parseFloat(String(customerDepositData.totalDepositAmount)) : 0,
                                transferDate: customerDepositData.transferDate ? new Date(customerDepositData.transferDate) : new Date(),
                                receivingAccount: customerDepositData.receivingAccount || "",
                                notes: customerDepositData.notes || "",
                                transferSlipUrl: customerDepositData.transferSlipUrl || customerDepositTransferSlipUrl || data.transferSlipUrl,
                                deposit_purpose: data.deposit_purpose || null
                            }
                        });

                      


                        // Create exchange record if exchange data exists
                        let exchangeId = null;
                        if (exchangeData) {
                            const exchange = await prisma.finance_exchange.create({
                                data: {
                                    salespersonId: exchangeData.salesperson,
                                    documentNumber: exchangeData.documentNumber,
                                    customerId: exchangeData.customerId,
                                    amountRMB: parseFloat(String(exchangeData.amountRMB || 0)),
                                    priceDifference: parseFloat(String(exchangeData.priceDifference || 0)),
                                    exchangeRate: parseFloat(String(exchangeData.exchangeRate || 0)),
                                    fee: parseFloat(String(exchangeData.fee || 0)),
                                    amount: parseFloat(String(exchangeData.amount || 0)),
                                    transferDate: exchangeData?.transferDate ? new Date(exchangeData.transferDate) : new Date(),
                                    receivingAccount: exchangeData.receivingAccount || "",
                                    exchangeRateProfit:exchangeData.exchangeRateProfit ? parseFloat(String(exchangeData.exchangeRateProfit)) : 0,
                                    incomePerTransaction: exchangeData.incomePerTransaction ? parseFloat(String(exchangeData.incomePerTransaction)) : 0,
                                    notes: exchangeData.notes || "",
                                    transferSlipUrl: exchangeData?.transferSlipUrl || exchangeTransferSlipUrl || data.transferSlipUrl
                                }
                            });
                            exchangeId = exchange.id;


                       
                        }

                        // Create main transaction record
                        transactionData = await prisma.finance_transaction.create({
                            data: {
                                type: data.type,
                                customerDepositId: customerDeposit.id,
                                exchangeId: exchangeId,
                                date: new Date(data.date),
                                documentNumber: data.documentNumber,
                                customerId: data.customerId,
                                salespersonId: data.salesperson,
                                amountRMB: customerDeposit?.amountRMB || 0,
                                transferDate: customerDeposit?.transferDate ? new Date(customerDeposit.transferDate) : new Date()
                            }
                        });

                        const financial_recode = await prisma.financial_record.create({
                            data: {
                                date: new Date(data.date),
                                type: 'PAYMENT',
                                accountOwner: exchangeData?.receivingAccount || '',
                                amountRMB: exchangeData?.amountRMB ? parseFloat(String(exchangeData.amountRMB)) : 0,
                                transferDate: exchangeData?.transferDate ? new Date(exchangeData.transferDate) : new Date(),
                                transferSlip: exchangeData?.transferSlipUrl || exchangeTransferSlipUrl || data.transferSlipUrl,
                                financial_transaction_id: transactionData?.id,
                                amountTHB: exchangeData.amount ? parseFloat(String(exchangeData.amount)) : 0,
                                exchangeRate: exchangeData.exchangeRate ? parseFloat(String(exchangeData.exchangeRate)) : 0,
                                payTo: exchangeData.receivingAccount,
                                details: '',
                                title: data.type == 'order' ? 'ฝากสั่งซื้อ' : 'ฝากโอน',
                            }
                        })
                    }

                    return res.status(201).json({
                        message: "บันทึกข้อมูลสำเร็จ",
                        statusCode: 201,
                        id: transactionData?.id,
                        data: transactionData
                    });
                } catch (error: any) {
                    console.error("Error creating transaction:", error);
                    return res.status(500).json({
                        message: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
                        statusCode: 500
                    });
                }
            
        } catch (err: any) {
            console.error("Error creating transaction:", err);
            return res.status(500).json({
                message: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
                statusCode: 500
            });
        }
    }



    public async getTransactions(req: Request, res: Response) {
        try {
            const transactions = await prisma.finance_transaction.findMany({
                where: {
                    deletedAt: null
                },
                include: {
                    customerDeposit: true,
                    exchange: true,
                    user: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            const formattedTransactions = transactions.map(transaction => {
                let customerDeposit = {}
                let exchange = {}
                if (transaction.customerDeposit) {
                    customerDeposit = {
                        amountRMB: transaction.customerDeposit.amountRMB,
                        priceDifference: transaction.customerDeposit.priceDifference,
                        exchangeRate: transaction.customerDeposit.exchangeRate,
                        fee: transaction.customerDeposit.fee,
                        amount: transaction.customerDeposit.amount,
                        vat: transaction.customerDeposit.vat,
                        totalWithVat: transaction.customerDeposit.totalWithVat,
                        transferDate: transaction.customerDeposit.transferDate,
                        receivingAccount: transaction.customerDeposit.receivingAccount,
                        notes: transaction.customerDeposit.notes,
                        transferSlipUrl: transaction.customerDeposit.transferSlipUrl,
                        deposit_purpose: transaction.customerDeposit.deposit_purpose
                    }
                };
                if (transaction.exchange) {
                    exchange = {
                        amountRMB: transaction.exchange.amountRMB,
                        priceDifference: transaction.exchange.priceDifference,
                        exchangeRate: transaction.exchange.exchangeRate,
                        fee: transaction.exchange.fee,
                        amount: transaction.exchange.amount,
                        productDetails: transaction.exchange.productDetails,
                        orderStatus: transaction.exchange.orderStatus,
                        topupPlatform: transaction.exchange.topupPlatform,
                        topupAccount: transaction.exchange.topupAccount,
                        incomePerTransaction: transaction.exchange.incomePerTransaction,
                        transferDate: transaction.exchange.transferDate,
                        receivingAccount: transaction.exchange.receivingAccount,
                        notes: transaction.exchange.notes,
                        transferSlipUrl: transaction.exchange.transferSlipUrl,
                    }
                };


                return {
                    id: transaction.id,
                    type: transaction.type,
                    date: transaction.date,
                    user: transaction.user,
                    deposit_purpose: transaction.customerDeposit?.deposit_purpose || null,
                    documentNumber: transaction.documentNumber,
                    customerId: transaction.customerId,
                    salespersonId: transaction.salespersonId,
                    createdAt: transaction.createdAt,
                    updatedAt: transaction.updatedAt,
                    customerDeposit: customerDeposit,
                    exchange: exchange
                };
            });

            return res.status(200).json({
                message: "ดึงข้อมูลสำเร็จ",
                statusCode: 200,
                data: formattedTransactions
            });
        } catch (error: any) {
            console.error('Error in getTransactions:', error);
            return res.status(500).json({
                message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
                statusCode: 500,
                error: error.message
            });
        }
    }

    public async getTransactionById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            console.log(`Fetching transaction with ID: ${id}`);

            const transaction = await prisma.finance_transaction.findUnique({
                where: {
                    id: id,
                    deletedAt: null
                },
                include: {
                    customerDeposit: true,
                    exchange: true,
                    user: {
                        select: {
                            id: true,
                            fullname: true,
                            email: true
                        }
                    },
                }
            });

            if (!transaction) {
                console.log(`Transaction with ID ${id} not found`);
                return res.status(404).json({
                    message: "ไม่พบข้อมูลรายการ",
                    statusCode: 404
                });
            }

            console.log(`Successfully fetched transaction with ID: ${id}`);
            return res.status(200).json({
                message: "ดึงข้อมูลสำเร็จ",
                statusCode: 200,
                data: transaction
            });
        } catch (error: any) {
            console.error("Error fetching transaction:", error);
            return res.status(500).json({
                message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
                statusCode: 500
            });
        }
    }

    public async updateTransaction(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const data = req.body;

            // แปลง data.customerDeposit และ data.exchange จาก [Object: null prototype] เป็น Object ปกติ
            // กำหนด interface สำหรับข้อมูล
            interface CustomerDepositData {
                amountRMB?: string | number;
                exchangeRate?: string | number;
                fee?: string | number;
                amount?: string | number;
                vat?: string | number;
                totalWithVat?: string | number;
                transferDate?: string;
                receivingAccount?: string;
                notes?: string;
                transferSlipUrl?: string;
                exchangeRateProfit?: string | number;
                incomePerTransaction?: string | number;
                totalDepositAmount?: string | number;
                includeVat?: boolean | string;
                [key: string]: any; // เพิ่ม index signature เพื่อให้สามารถใช้ dynamic key ได้
            }

            interface ExchangeData {
                amountRMB?: string | number;
                priceDifference?: string | number;
                exchangeRate?: string | number;
                fee?: string | number;
                amount?: string | number;
                vat?: string | number;
                totalWithVat?: string | number;
                transferDate?: string;
                receivingAccount?: string;
                notes?: string;
                transferSlipUrl?: string;
                exchangeRateProfit?: string | number;
                incomePerTransaction?: string | number;
                [key: string]: any; // เพิ่ม index signature เพื่อให้สามารถใช้ dynamic key ได้
            }


            console.log("Form data keys:", Object.keys(data));

            // แปลงข้อมูล customerDeposit จาก dot notation
            let customerDepositData: CustomerDepositData = {};

            // ตรวจสอบว่ามีข้อมูล customerDeposit หรือไม่
            const customerDepositKeys = Object.keys(data).filter(key => key.startsWith('customerDeposit.'));
            console.log("customerDeposit keys:", customerDepositKeys);

            if (customerDepositKeys.length > 0) {
                // มีข้อมูล customerDeposit ในรูปแบบ dot notation
                customerDepositKeys.forEach(key => {
                    const fieldName = key.replace('customerDeposit.', '');
                    customerDepositData[fieldName as keyof CustomerDepositData] = data[key];
                });
                console.log("customerDepositData from dot notation:", customerDepositData);
            } else if (data.customerDeposit) {
                // กรณีที่ข้อมูลอยู่ในรูปแบบ Object
                try {
                    if (typeof data.customerDeposit === 'string') {
                        customerDepositData = JSON.parse(data.customerDeposit);
                    } else {
                        // ใช้วิธีการที่หลากหลายเพื่อแปลง [Object: null prototype] เป็น Object ปกติ
                        try {
                            customerDepositData = JSON.parse(JSON.stringify(data.customerDeposit));
                        } catch (e) {
                            try {
                                customerDepositData = Object.fromEntries(Object.entries(data.customerDeposit));
                            } catch (e2) {
                                customerDepositData = Object.assign({}, data.customerDeposit);
                            }
                        }
                    }
                } catch (error) {
                    throw error;
                    console.error("Error parsing customerDeposit:", error);
                }
            }

            console.log("Final customerDepositData:", customerDepositData);

            // แปลงข้อมูล exchange จาก dot notation
            let exchangeData: ExchangeData = {};

            // ตรวจสอบว่ามีข้อมูล exchange หรือไม่
            const exchangeKeys = Object.keys(data).filter(key => key.startsWith('exchange.'));
            console.log("exchange keys:", exchangeKeys);

            if (exchangeKeys.length > 0) {
                // มีข้อมูล exchange ในรูปแบบ dot notation
                exchangeKeys.forEach(key => {
                    const fieldName = key.replace('exchange.', '');
                    exchangeData[fieldName] = data[key];
                });
                console.log("exchangeData from dot notation:", exchangeData);
            } else if (data.exchange) {
                // กรณีที่ข้อมูลอยู่ในรูปแบบ Object
                try {
                    if (typeof data.exchange === 'string') {
                        exchangeData = JSON.parse(data.exchange);
                    } else {
                        // ใช้วิธีการที่หลากหลายเพื่อแปลง [Object: null prototype] เป็น Object ปกติ
                        try {
                            exchangeData = JSON.parse(JSON.stringify(data.exchange));
                        } catch (e) {
                            try {
                                exchangeData = Object.fromEntries(Object.entries(data.exchange));
                            } catch (e2) {
                                exchangeData = Object.assign({}, data.exchange);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error parsing exchange:", error);
                }
            }

            console.log("Final exchangeData:", exchangeData);

            // ตัวแปรสำหรับเก็บ URL ของไฟล์ที่อัปโหลด
            let customerDepositTransferSlipUrl = null;
            let exchangeTransferSlipUrl = null;


            // ถ้ามีไฟล์ลูกค้าฝากชำระให้บันทึกไฟล์
            if (files && files['customerDepositFile'] && files['customerDepositFile'][0]) {
                const file = files['customerDepositFile'][0];
                // สร้างชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำกัน
                const fileName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
                const uploadPath = path.join('public/images/transferSlip', fileName);

                // บันทึกไฟล์
                fs.renameSync(file.path, uploadPath);

                // กำหนด URL สำหรับไฟล์
                customerDepositTransferSlipUrl = `/images/transferSlip/${fileName}`;
                console.log('Customer deposit file uploaded, transferSlipUrl set to:', customerDepositTransferSlipUrl);
            }

            // ถ้ามีไฟล์การโอนให้บันทึกไฟล์
            if (files && files['exchangeFile'] && files['exchangeFile'][0]) {
                const fileExchange = files['exchangeFile'][0];
                // สร้างชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำกัน
                const fileName = `${Date.now()}-${uuidv4()}${path.extname(fileExchange.originalname)}`;
                const uploadPathExchange = path.join('public/images/exchange', fileName);

                // บันทึกไฟล์
                fs.renameSync(fileExchange.path, uploadPathExchange);

                // กำหนด URL สำหรับไฟล์
                exchangeTransferSlipUrl = `/images/exchange/${fileName}`;
                console.log('Exchange file uploaded, transferSlipUrl set to:', exchangeTransferSlipUrl);

            }

            // ถ้าข้อมูลส่งมาเป็น JSON string ให้แปลงเป็น object
            if (typeof data.customerDeposit === 'string') {
                data.customerDeposit = JSON.parse(data.customerDeposit);
            }

            if (typeof data.exchange === 'string') {
                data.exchange = JSON.parse(data.exchange);
            }

            // Check if transaction exists
            const existingTransaction = await prisma.finance_transaction.findUnique({
                where: {
                    id: id,
                    deletedAt: null
                },
                include: {
                    customerDeposit: true,
                    exchange: true
                }
            });

            if (!existingTransaction) {
                return res.status(404).json({
                    message: "ไม่พบข้อมูลรายการ",
                    statusCode: 404
                });
            }

            // Update based on transaction type
            if (existingTransaction.customerDeposit) {

                console.log("data.customerDeposit", customerDepositData.amountRMB)
             
                // Update customer deposit
                await prisma.finance_customer_deposit.update({
                    where: {
                        id: existingTransaction.customerDeposit.id
                    },
                    data: {
                        date: data.date ? new Date(data.date) : undefined,
                        salespersonId: data.salesperson,
                        documentNumber: data.documentNumber,
                        customerId: data.customerId,
                        amountRMB: customerDepositData.amountRMB ? parseFloat(String(customerDepositData.amountRMB)) : undefined,
                        priceDifference: customerDepositData.priceDifference ? parseFloat(String(customerDepositData.priceDifference)) : undefined,
                        exchangeRate: customerDepositData.exchangeRate ? parseFloat(String(customerDepositData.exchangeRate)) : undefined,
                        fee: customerDepositData.fee ? parseFloat(String(customerDepositData.fee)) : undefined,
                        amount: customerDepositData.amount ? parseFloat(String(customerDepositData.amount)) : undefined,
                        vat: customerDepositData.vat ? parseFloat(String(customerDepositData.vat)) : undefined,
                        totalWithVat: customerDepositData.totalWithVat ? parseFloat(String(customerDepositData.totalWithVat)) : undefined,
                        totalDepositAmount: customerDepositData.totalDepositAmount ? parseFloat(String(customerDepositData.totalDepositAmount)) : undefined,
                        transferDate: customerDepositData.transferDate ? new Date(customerDepositData.transferDate) : undefined,
                        receivingAccount: customerDepositData.receivingAccount,
                        notes: customerDepositData.notes,
                        ...customerDepositTransferSlipUrl ? {transferSlipUrl: customerDepositTransferSlipUrl} : {},
                        updatedAt: new Date()
                    }
                });
            }

            if (existingTransaction.exchange) {
                console.log("update", existingTransaction.exchange?.id)
                console.log(" data.exchange", data.exchange)


                await prisma.finance_exchange.update({
                    where: {
                        id: existingTransaction.exchange?.id
                    },
                    data: {
                        date: data.date ? new Date(data.date) : undefined,
                        salespersonId: data.salesperson, // Fixed: using salesperson instead of salespersonId
                        documentNumber: data.documentNumber,
                        customerId: data.customerId,
                        amountRMB: exchangeData.amountRMB ? parseFloat(String(exchangeData.amountRMB)) : undefined,
                        priceDifference: exchangeData.priceDifference ? parseFloat(String(exchangeData.priceDifference)) : undefined,
                        exchangeRate: exchangeData.exchangeRate ? parseFloat(String(exchangeData.exchangeRate)) : undefined,
                        fee: exchangeData.fee ? parseFloat(String(exchangeData.fee)) : undefined,
                        amount: exchangeData.amount ? parseFloat(String(exchangeData.amount)) : undefined,
                        transferDate: exchangeData.transferDate ? new Date(exchangeData.transferDate) : undefined,
                        receivingAccount: exchangeData.receivingAccount,
                        exchangeRateProfit: exchangeData.exchangeRateProfit ? parseFloat(String(exchangeData.exchangeRateProfit)) : undefined,
                        incomePerTransaction: exchangeData.incomePerTransaction ? parseFloat(String(exchangeData.incomePerTransaction)) : undefined,
                        notes: exchangeData.notes,
                        ...exchangeTransferSlipUrl ? {transferSlipUrl: exchangeTransferSlipUrl} : {},
                        updatedAt: new Date()
                    }
                });


                // ค้นหา financial_record ที่มี financial_transaction_id ตรงกับ transaction id
                const existingFinancialRecord = await prisma.financial_record.findFirst({
                    where: {
                        financial_transaction_id: existingTransaction.id
                    }
                });

                if (existingFinancialRecord) {
                    // อัปเดต financial_record ที่มีอยู่แล้ว
                    await prisma.financial_record.update({
                        where: {
                            id: existingFinancialRecord.id
                        },
                        data: {
                            date: new Date(data.date),
                            type: 'PAYMENT',
                            accountOwner: exchangeData.receivingAccount,
                            amountRMB: parseFloat(String(exchangeData.amountRMB || 0)),
                            transferDate: exchangeData.transferDate ? new Date(exchangeData.transferDate) : undefined,
                            transferSlip: exchangeData.transferSlipUrl || exchangeTransferSlipUrl,
                            details: '',
                            title: data.type == 'order' ? 'ฝากสั่งซื้อ' : 'ฝากโอน',
                        }
                    });
                } else {
                    // สร้าง financial_record ใหม่
                    await prisma.financial_record.create({
                        data: {
                            date: new Date(data.date),
                            type: 'PAYMENT',
                            accountOwner: exchangeData?.receivingAccount || "",
                            transferDate: exchangeData?.transferDate ? new Date(exchangeData.transferDate) : new Date(),
                            amountRMB: parseFloat(String(exchangeData.amountRMB || 0)),
                            transferSlip: exchangeData.transferSlipUrl || exchangeTransferSlipUrl,
                            details: '',
                            title: data.type == 'order' ? 'ฝากสั่งซื้อ' : 'ฝากโอน',
                            financial_transaction_id: existingTransaction.id
                        }
                    });
                }

                // สร้าง financial_record สำหรับ customer deposit ถ้ายังไม่มี
                if (existingTransaction.customerDeposit && !existingFinancialRecord) {
                    const customerDepositFinancialRecord = await prisma.financial_record.create({
                        data: {
                            date: data.date ? new Date(data.date) : new Date(),
                            type: 'PAYMENT',
                            financial_transaction_id: existingTransaction.id,
                            accountOwner: customerDepositData.receivingAccount || "",
                            amountRMB: customerDepositData.amountRMB ? parseFloat(String(customerDepositData.amountRMB)) : 0,
                            transferDate: customerDepositData.transferDate ? new Date(customerDepositData.transferDate) : new Date(),
                            transferSlip: customerDepositData.transferSlipUrl || customerDepositTransferSlipUrl,
                            details: '',
                            title: data.type == 'order' ? 'ฝากสั่งซื้อ' : 'ฝากโอน',
                        },
                        select: {
                            id: true
                        }
                    });

                    // Link the financial record to the customer deposit

                }

                // Update transaction record
                const updatedTransaction = await prisma.finance_transaction.update({
                    where: {
                        id: id
                    },
                    data: {
                        date: data.date ? new Date(data.date) : undefined,
                        documentNumber: data.documentNumber,
                        customerId: data.customerId,
                        salespersonId: data.salespersonId,
                        amountRMB: data.amountRMB ? parseFloat(data.amountRMB) : undefined,
                        transferDate: data.transferDate ? new Date(data.transferDate) : undefined,
                        updatedAt: new Date()
                    }
                });

                // อัปเดต financial_record ถ้ามี
                try {
                    const existingRecord = await prisma.financial_record.findFirst({
                        where: {
                            financial_transaction_id: id
                        }
                    });

                    if (existingRecord) {
                        await prisma.financial_record.update({
                            where: {
                                id: existingRecord.id
                            },
                            data: {
                                date: data.date ? new Date(data.date) : new Date(),
                                type: 'PAYMENT',
                                accountOwner: customerDepositData.receivingAccount || "",
                                amountRMB: customerDepositData.amountRMB ? parseFloat(String(customerDepositData.amountRMB)) : 0,
                                transferDate: customerDepositData.transferDate ? new Date(customerDepositData.transferDate) : new Date(),
                                transferSlip: customerDepositData.transferSlipUrl || customerDepositTransferSlipUrl,
                                details: '',
                                title: data.type == 'order' ? 'ฝากสั่งซื้อ' : 'ฝากโอน',
                                updatedAt: new Date()
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error updating financial record:", error);
                    // ไม่ส่ง response กลับที่นี่ เพื่อป้องกันการส่ง response ซ้ำ
                }

                // ส่ง response กลับเพียงครั้งเดียวตรงนี้
                return res.status(200).json({
                    message: "อัปเดตข้อมูลสำเร็จ",
                    statusCode: 200,
                    data: updatedTransaction
                });
            }
        }
        catch (error: any) {
            console.error("Error updating transaction:", error);
            return res.status(500).json({
                message: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
                statusCode: 500
            });
        }
    }

    public async deleteTransaction(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Soft delete by setting deletedAt
            const transaction = await prisma.finance_transaction.update({
                where: {
                    id: id
                },
                data: {
                    deletedAt: new Date()
                }
            });

            // Also soft delete related records
            if (transaction.customerDepositId) {
                await prisma.finance_customer_deposit.update({
                    where: {
                        id: transaction.customerDepositId
                    },
                    data: {
                        deletedAt: new Date()
                    }
                });
            }

            if (transaction.exchangeId) {
                await prisma.finance_exchange.update({
                    where: {
                        id: transaction.exchangeId
                    },
                    data: {
                        deletedAt: new Date()
                    }
                });
            }

            return res.status(200).json({
                message: "ลบข้อมูลสำเร็จ",
                statusCode: 200
            });
        } catch (error: any) {
            console.error("Error deleting transaction:", error);
            return res.status(500).json({
                message: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล",
                statusCode: 500
            });
        }
    }
}
