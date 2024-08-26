import { Request, Response } from "express";
import SystemRepository from "../../repository/system/index.repository";


import { PrismaClient } from "@prisma/client";

import moment from 'moment'
import path from "path";
import fs from "fs";
import { RequestProductImage } from "../../interface/sale.interface";

export class SystemService {
    private systemRepository: SystemRepository;

    constructor() {
        this.systemRepository = new SystemRepository();
    }



    async getDataAgency(page: number): Promise<any> {
        try {
            const data = await this.systemRepository.getDataAgency(page);
            return data;
        }
        catch (err: any) {
            throw new Error(err)
        }

    }

    async createAgency(data: any): Promise<any> {
        try {
            const toTal = await this.systemRepository.createAgency(data);

            
            const response ={
                message: 'บันทึกข้อมูลสำเร็จ',
                statusCode: 200
            }
            return response;
        }
        catch (err: any) {
            throw new Error(err)
        }
    }


    async updateAgency(data: any,id:string): Promise<any> {
        try {
            const toTal = await this.systemRepository.updateAgency(data,id);

        
            const response ={
                message: 'บันทึกข้อมูลสำเร็จ',
                statusCode: 200
            }
            return response;
        }
        catch (err: any) {
            throw new Error(err);
    }

    }

    async deleteAgency(id:string): Promise<any>{
        try {
            const toTal = await this.systemRepository.deleteAgency(id);

    
            const response ={
                message: 'ลบข้อมูลสำเร็จ',
                statusCode: 200
            }
            return response;
        }
        catch (err: any) {
            throw new Error(err);
    }
    }

    async getCurrentData(page:number): Promise<any>{
        try {
            const data = await this.systemRepository.getCurrentData(page);
            return data;
        }
        catch(err:any){
            throw new Error(err);
        }
    }

    async createCurrent(data: any): Promise<any> {
        try {
            let dataCurrent ={
                ...data,
                rate_money : parseFloat(data.rate_money)
            }
            const toTal = await this.systemRepository.createCurrent(dataCurrent);
            const response ={
                message: 'บันทึกข้อมูลสำเร็จ',
                statusCode: 200
            }
            return response;
        }
        catch (err: any) {
            throw new Error(err)
        }
    }

    async updateCurrent(data: any,id:string): Promise<any> {
        try {
            let dataCurrent ={
                ...data,
                rate_money : parseFloat(data.rate_money)
            }
            const toTal = await this.systemRepository.updateCurrent(dataCurrent,id);
            const response ={
                message: 'บันทึกข้อมูลสำเร็จ',
                statusCode: 200
            }
            return response;
        }
        catch (err: any) {
            throw new Error(err);
    }
    }

    async deleteCurrent(id:string): Promise<any>{
        try {
            const toTal = await this.systemRepository.deleteCurrent(id);
            const response ={
                message: 'ลบข้อมูลสำเร็จ',
                statusCode: 200
            }
            return response;
        }
        catch (err: any) {
            throw new Error(err);
    }
    }

    async getDocumentData(page:number): Promise<any>{
        try{    
            const data = await this.systemRepository.getDocumentData(page);
            return data;
        }
        catch(err:any){
            throw new Error(err);
        }
        

    }


  

}