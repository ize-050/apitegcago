import { Request, Response } from "express";
import NotificationRepository from "../../repository/notification/index.repository";


import { PrismaClient } from "@prisma/client";

import moment from 'moment'
import path from "path";
import fs from "fs";
import { RequestProductImage } from "../../interface/sale.interface";

export class NotificationService {
    private notificationRepository: NotificationRepository;

    constructor() {
        this.notificationRepository = new NotificationRepository();
    }



    async getNotification(userId: string): Promise<any> {
        try {
            const data = await this.notificationRepository.getNotification(userId);
            return data;

        }
        catch (err: any) {
            throw new Error(err)
        }

    }

    async readNotification(id: string): Promise<any> {
        try {
            const data = await this.notificationRepository.readNotification(id);
            return data;

        }
        catch (err: any) {
            throw new Error(err)
        }

    }

    async readAllNotifications(userId: string): Promise<any> {
        try {
            const data = await this.notificationRepository.readAllNotifications(userId);
            return data;

        }
        catch (err: any) {
            throw new Error(err)
        }

    }

}