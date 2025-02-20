import { Router } from 'express';
import { FinanceController } from '../../controllers/finance/index.controller';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // For password hashing


import express from 'express'
import { Request, Response } from 'express';
import authMiddleware from "../../middleware/authMiddleware";
import multer from "multer";
import path from "path";
const router = Router()
const { v4: uuidv4 } = require('uuid');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/temp'); // Specify the directory where you want to store files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${uuidv4()}`+path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage });
const financeController = new FinanceController();



router.get('/getPurchase', authMiddleware,(req, res) =>  financeController.getPurchase(req, res));
router.get('/getPurchaseById/:id',authMiddleware, (req, res) =>  financeController.getPurchaseById(req, res));

router.get('/getWorkByid/:id',authMiddleware, (req, res) =>  financeController.getWorkByid(req, res));


router.post('/submitPurchase',authMiddleware, (req, res) =>  financeController.submitPurchase(req, res));
router.put('/updatePurchase/:id',authMiddleware, (req, res) =>  financeController.updatePurchase(req, res));


//
router.get('/purchase',authMiddleware, (req, res) =>  financeController.getPurchaseBySearch(req, res));
router.get('/getWidhdrawalInformation',authMiddleware, (req, res) =>  financeController.getWidhdrawalInformation(req, res));
router.post('/submitwidhdrawalInformation',authMiddleware, (req, res) =>  financeController.submitWidhdrawalInformation(req, res));
router.post('/updatewidhdrawalInformation',authMiddleware, (req, res) =>  financeController.updateWidhdrawalInformation(req, res));

router.delete('/withdrawal_information/:id',authMiddleware, (req, res) =>  financeController.deleteWithdrawalInformation(req, res));


  




module.exports = router