import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";

export class FinanceCompanyController {
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
            const companies = await this.prisma.finance_company_account.findMany({
                where: {
                    deletedAt: null
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return res.json(companies);
        } catch (error) {
            console.error('Error getting companies:', error);
            return res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
            });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { company_name, bank_name, bank_account } = req.body;

            if (!company_name || !bank_name || !bank_account) {
                return res.status(400).json({
                    message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
                });
            }

            const company = await this.prisma.finance_company_account.create({
                data: {
                    company_name,
                    bank_name,
                    bank_account
                }
            });

            return res.json(company);
        } catch (error) {
            console.error('Error creating company:', error);
            return res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { company_name, bank_name, bank_account } = req.body;

            if (!company_name || !bank_name || !bank_account) {
                return res.status(400).json({
                    message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
                });
            }

            const company = await this.prisma.finance_company_account.update({
                where: { id },
                data: {
                    company_name,
                    bank_name,
                    bank_account,
                    updatedAt: new Date()
                }
            });

            return res.json(company);
        } catch (error) {
            console.error('Error updating company:', error);
            return res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล'
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await this.prisma.finance_company_account.update({
                where: { id },
                data: {
                    deletedAt: new Date()
                }
            });

            return res.json({
                message: 'ลบข้อมูลสำเร็จ'
            });
        } catch (error) {
            console.error('Error deleting company:', error);
            return res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการลบข้อมูล'
            });
        }
    }
}
