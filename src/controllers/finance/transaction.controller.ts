import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { TransactionCreateDto, TransactionUpdateDto } from "../../services/finance/dto/transaction.interface";
import { ConsignmentCreateDto } from "../../services/finance/dto/consignment.interface";
import z from "zod";
import upload from "../../config/multerConfig";
import multer from "multer";

export class TransactionController {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async createTransaction(req: Request, res: Response) {
        try {
            const data :any = req.body;
            
            // Validate required fields
            if (!data.type || !data.date || !data.documentNumber || !data.customerId || !data.salesperson) {
                return res.status(400).json({
                    message: "กรุณากรอกข้อมูลให้ครบถ้วน",
                    statusCode: 400
                });
            }

            let transactionData = null;

            // Handle customer deposit type
            if (data.customerDeposit) {
                const customerDeposit = await this.prisma.finance_customer_deposit.create({
                    data: {
                        salespersonId: data.salesperson,
                        documentNumber: data.documentNumber,
                        customerId: data.customerId,
                        amountRMB: parseFloat(data.customerDeposit.amountRMB || 0),
                        exchangeRate: parseFloat(data.customerDeposit.exchangeRate || 0),
                        fee: parseFloat(data.customerDeposit.fee || 0),
                        amount: parseFloat(data.customerDeposit.amount || 0),
                        vat: parseFloat(data.customerDeposit.vat || 0),
                        totalWithVat: parseFloat(data.customerDeposit.totalWithVat || 0),
                        transferDate: new Date(data.customerDeposit.transferDate),
                        receivingAccount: data.customerDeposit.receivingAccount || "",
                        notes: data.customerDeposit.notes || "",
                        transferSlipUrl: data.transferSlipUrl,
                        deposit_purpose: data.deposit_purpose || null
                    }
                });


              

                // Create exchange record if exchange data exists
                let exchangeId = null;
                if (data.exchange) {
                    const exchange = await this.prisma.finance_exchange.create({
                        data: {
                            salespersonId: data.salesperson,
                            documentNumber: data.documentNumber,
                            customerId: data.customerId,
                            amountRMB: parseFloat(data.exchange.amountRMB || 0),
                            priceDifference: parseFloat(data.exchange.priceDifference || 0),
                            exchangeRate: parseFloat(data.exchange.exchangeRate || 0),
                            fee: parseFloat(data.exchange.fee || 0),
                            amount: parseFloat(data.exchange.amount || 0),
                            transferDate: new Date(data.exchange.transferDate),
                            receivingAccount: data.exchange.receivingAccount || "",
                            exchangeRateProfit: parseFloat(data.exchange.exchangeRateProfit || 0),
                            incomePerTransaction: parseFloat(data.exchange.incomePerTransaction || 0),
                            notes: data.exchange.notes || "",
                            transferSlipUrl: data.transferSlipUrl
                        }
                    });
                    exchangeId = exchange.id;


                    const  financial_recode = await this.prisma.financial_record.create({
                        data:{
                            date: new Date(data.date),
                            type: 'PAYMENT',
                            accountOwner: data.exchange.receivingAccount,
                            amountRMB: parseFloat(data.exchange.amountRMB || 0),
                            transferDate: new Date(data.exchange.transferDate),
                            transferSlip: data.transferSlipUrl,
                            details :'',
                            title:data.exchange.notes,
                        }
                    })
                }

                // Create main transaction record
                transactionData = await this.prisma.finance_transaction.create({
                    data: {
                        type: data.type,
                        customerDepositId: customerDeposit.id,
                        exchangeId: exchangeId,
                        date: new Date(data.date),
                        documentNumber: data.documentNumber,
                        customerId: data.customerId,
                        salespersonId: data.salesperson,
                        amountRMB: parseFloat(data.customerDeposit.amountRMB || 0),
                        transferDate: new Date(data.customerDeposit.transferDate)
                    }
                });
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
    }

    public async getTransactions(req: Request, res: Response) {
        try {
            const transactions = await this.prisma.finance_transaction.findMany({
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
                  let   customerDeposit =  {}
                  let   exchange = {}
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
                    user:transaction.user,
                    deposit_purpose: transaction.customerDeposit?.deposit_purpose || null,
                    documentNumber: transaction.documentNumber,
                    customerId: transaction.customerId,
                    salespersonId: transaction.salespersonId,
                    createdAt: transaction.createdAt,
                    updatedAt: transaction.updatedAt,
                    customerDeposit:customerDeposit,
                    exchange:exchange
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

    // public async getTransactionById(req: Request, res: Response) {
    //     try {
    //         const { id } = req.params;

    //         const transaction = await this.prisma.finance_transaction.findUnique({
    //             where: {
    //                 id: id,
    //                 deletedAt: null
    //             },
    //             include: {
    //                 customerDeposit: true,
    //                 consignment: true
    //             }
    //         });

    //         if (!transaction) {
    //             return res.status(404).json({
    //                 message: "ไม่พบข้อมูลรายการ",
    //                 statusCode: 404
    //             });
    //         }

    //         return res.status(200).json({
    //             message: "ดึงข้อมูลสำเร็จ",
    //             statusCode: 200,
    //             data: transaction
    //         });
    //     } catch (error: any) {
    //         console.error("Error fetching transaction:", error);
    //         return res.status(500).json({
    //             message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
    //             statusCode: 500
    //         });
    //     }
    // }

    // public async updateTransaction(req: Request, res: Response) {
    //     try {
    //         const { id } = req.params;
    //         const data = req.body;

    //         // Check if transaction exists
    //         const existingTransaction = await this.prisma.finance_transaction.findUnique({
    //             where: {
    //                 id: id,
    //                 deletedAt: null
    //             },
    //             include: {
    //                 customerDeposit: true,
    //                 consignment: true
    //             }
    //         });

    //         if (!existingTransaction) {
    //             return res.status(404).json({
    //                 message: "ไม่พบข้อมูลรายการ",
    //                 statusCode: 404
    //             });
    //         }

    //         // Update based on transaction type
    //         if (existingTransaction.type === "deposit" && existingTransaction.customerDeposit) {
    //             // Update customer deposit
    //             await this.prisma.finance_customer_deposit.update({
    //                 where: {
    //                     id: existingTransaction.customerDeposit.id
    //                 },
    //                 data: {
    //                     date: data.date ? new Date(data.date) : undefined,
    //                     salespersonId: data.salespersonId,
    //                     documentNumber: data.documentNumber,
    //                     customerId: data.customerId,
    //                     amountRMB: data.amountRMB ? parseFloat(data.amountRMB) : undefined,
    //                     priceDifference: data.priceDifference ? parseFloat(data.priceDifference) : undefined,
    //                     exchangeRate: data.exchangeRate ? parseFloat(data.exchangeRate) : undefined,
    //                     fee: data.fee ? parseFloat(data.fee) : undefined,
    //                     amount: data.amount ? parseFloat(data.amount) : undefined,
    //                     vat: data.vat ? parseFloat(data.vat) : undefined,
    //                     totalWithVat: data.totalWithVat ? parseFloat(data.totalWithVat) : undefined,
    //                     transferDate: data.transferDate ? new Date(data.transferDate) : undefined,
    //                     receivingAccount: data.receivingAccount,
    //                     exchangeRateProfit: data.exchangeRateProfit ? parseFloat(data.exchangeRateProfit) : undefined,
    //                     incomePerTransaction: data.incomePerTransaction ? parseFloat(data.incomePerTransaction) : undefined,
    //                     notes: data.notes,
    //                     transferSlipUrl: data.transferSlipUrl,
    //                     updatedAt: new Date()
    //                 }
    //             });
    //         } else if ((existingTransaction.type === "order" || existingTransaction.type === "topup") && existingTransaction.consignment) {
    //             // Update consignment
    //             await this.prisma.finance_consignment.update({
    //                 where: {
    //                     id: existingTransaction.consignment.id
    //                 },
    //                 data: {
    //                     date: data.date ? new Date(data.date) : undefined,
    //                     salespersonId: data.salespersonId,
    //                     documentNumber: data.documentNumber,
    //                     customerId: data.customerId,
    //                     amountRMB: data.amountRMB ? parseFloat(data.amountRMB) : undefined,
    //                     productDetails: data.productDetails,
    //                     orderStatus: data.orderStatus,
    //                     topupPlatform: data.topupPlatform,
    //                     topupAccount: data.topupAccount,
    //                     transferDate: data.transferDate ? new Date(data.transferDate) : undefined,
    //                     notes: data.notes,
    //                     transferSlipUrl: data.transferSlipUrl,
    //                     updatedAt: new Date()
    //                 }
    //             });
    //         }

    //         // Update transaction record
    //         const updatedTransaction = await this.prisma.finance_transaction.update({
    //             where: {
    //                 id: id
    //             },
    //             data: {
    //                 date: data.date ? new Date(data.date) : undefined,
    //                 documentNumber: data.documentNumber,
    //                 customerId: data.customerId,
    //                 salespersonId: data.salespersonId,
    //                 amountRMB: data.amountRMB ? parseFloat(data.amountRMB) : undefined,
    //                 transferDate: data.transferDate ? new Date(data.transferDate) : undefined,
    //                 updatedAt: new Date()
    //             }
    //         });

    //         return res.status(200).json({
    //             message: "อัปเดตข้อมูลสำเร็จ",
    //             statusCode: 200,
    //             data: updatedTransaction
    //         });
    //     } catch (error: any) {
    //         console.error("Error updating transaction:", error);
    //         return res.status(500).json({
    //             message: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
    //             statusCode: 500
    //         });
    //     }
    // }

    public async deleteTransaction(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Soft delete by setting deletedAt
            const transaction = await this.prisma.finance_transaction.update({
                where: {
                    id: id
                },
                data: {
                    deletedAt: new Date()
                }
            });

            // Also soft delete related records
            if (transaction.customerDepositId) {
                await this.prisma.finance_customer_deposit.update({
                    where: {
                        id: transaction.customerDepositId
                    },
                    data: {
                        deletedAt: new Date()
                    }
                });
            }

            if (transaction.exchangeId) {
                await this.prisma.finance_exchange.update({
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
