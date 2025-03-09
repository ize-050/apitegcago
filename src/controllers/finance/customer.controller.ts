import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";

export class FinanceCustomerController {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
        // Bind methods to maintain correct 'this' context
        this.getAll = this.getAll.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async getAll(req: Request, res: Response) {
        try {
            const customers = await this.prisma.finance_customer_account.findMany({
                where: {
                    deletedAt: null
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return res.json(customers);
        } catch (error) {
            console.error('Error getting customers:', error);
            return res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
            });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { finance_name } = req.body;

            if (!finance_name) {
                return res.status(400).json({
                    message: 'กรุณากรอกชื่อบัญชี'
                });
            }

            const customer = await this.prisma.finance_customer_account.create({
                data: {
                    finance_name
                }
            });

            return res.json(customer);
        } catch (error) {
            console.error('Error creating customer:', error);
            return res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { finance_name } = req.body;

            if (!finance_name) {
                return res.status(400).json({
                    message: 'กรุณากรอกชื่อบัญชี'
                });
            }

            const customer = await this.prisma.finance_customer_account.update({
                where: { id },
                data: {
                    finance_name,
                    updatedAt: new Date()
                }
            });

            return res.json(customer);
        } catch (error) {
            console.error('Error updating customer:', error);
            return res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล'
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await this.prisma.finance_customer_account.update({
                where: { id },
                data: {
                    deletedAt: new Date()
                }
            });

            return res.json({
                message: 'ลบข้อมูลสำเร็จ'
            });
        } catch (error) {
            console.error('Error deleting customer:', error);
            return res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการลบข้อมูล'
            });
        }
    }
}
