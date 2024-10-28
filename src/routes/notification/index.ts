import { Router } from 'express';
import { NotificationController } from '../../controllers/notification/index.controller';
import { CustomerController } from '../../controllers/customer/index.controller'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // For password hashing


import express from 'express'
import { Request, Response } from 'express';
import authMiddleware from '../../middleware/authMiddleware';
const router = Router()


const notificationController = new NotificationController();

const customerController = new CustomerController();

router.get('/getNotification',authMiddleware, (req, res) =>  notificationController.getNotification(req, res));

router.put('/updateNotification/:id',authMiddleware, (req, res) =>  notificationController.updateNotification(req, res));

router.put('/ReadAllNotifications',authMiddleware, (req, res) =>  notificationController.ReadAllNotifications(req, res));

module.exports = router