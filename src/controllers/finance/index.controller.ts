import { Request, Response } from "express";
import FinanceService from "../../services/finance/index.service";
import z from "zod";

//validate

import upload from "../../config/multerConfig";
import multer from "multer";
import moment from "moment";

export class FinanceController {
    private financeService;


    constructor() {
        this.financeService = new FinanceService();
    }

    public async getPurchaseBySearch(req: Request, res: Response) {
        try {

            const {search} :any = req.query;

            const purchase = await this.financeService.getPurchasebySearch(search)
            const Response = {
                data: purchase,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }


    public async getPurchase(req: Request, res: Response) {
        try {
            const purchase = await this.financeService.getPurchase(req.query)

            const Response = {
                data: purchase,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async getPurchaseById(req: Request, res: Response) {
        try {
            console.log("id",req.params.id)
            const purchase = await this.financeService.getPurchaseById(req.params.id)
            const Response = {
                data: purchase,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async getWorkByid(req: Request, res: Response) {
        try {
            console.log("id",req.params.id)
            const finance_work = await this.financeService.getWorkByid(req.params.id)
            const Response = {
                data: finance_work,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async submitPurchase(req: Request, res: Response) {
        try {
            const purchase = await this.financeService.submitPurchase(req.body)
            const Response = {
                data: purchase,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async updatePurchase(req: Request, res: Response) {
        try {

            const id = req.params.id

            const purchase = await this.financeService.updatePurchase(id,req.body)
            const Response = {
                data: purchase,
                message: "แก้ไขข้อมูลสำเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }


    //work
    public async getWidhdrawalInformation(req: Request, res: Response) {
        try {
            
            const Request = {
                page :req.query.page
            }
            const widhdrawalInformation = await this.financeService.getWidhdrawalInformation(Request)
            const Response = {
                data: widhdrawalInformation,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async submitWidhdrawalInformation(req: Request, res: Response) {
        try {
            
            const Check = await this.financeService.CheckWidhdrawalInformation(req.body)
            if(Check.length > 0){
                const Response = {
                    data: null,
                    message: "มีข้อมูล",
                    statusCode: 400
                }
                return res.status(200).json(Response);
            }

            const widhdrawalInformation = await this.financeService.submitWidhdrawalInformation(req.body)
            const Response = {
                data: widhdrawalInformation,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async updateWidhdrawalInformation(req: Request, res: Response) {
        try {
            const widhdrawalInformation = await this.financeService.updateWidhdrawalInformation(req.body)
            const Response = {
                data: widhdrawalInformation,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async deleteWithdrawalInformation(req: Request, res: Response) {
        try {
            const widhdrawalInformation = await this.financeService.deleteWithdrawalInformation(req.params.id)
            const Response = {
                data: widhdrawalInformation,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }




}
