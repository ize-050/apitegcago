import { Router } from 'express';
import { UserController } from '../../controllers/user/index.controller';
import { CustomerController } from '../../controllers/customer/index.controller'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // For password hashing


import express from 'express'
import { Request, Response } from 'express';
const router = Router()


const userController = new UserController();

const customerController = new CustomerController();

router.post('/login', (req, res) =>  userController.login(req, res));

router.get('/getCustomerGroup', (req, res) =>  customerController.getCustomerGroup(req, res));


module.exports = router