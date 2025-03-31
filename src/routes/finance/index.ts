import { Router } from 'express';
import { FinanceController } from '../../controllers/finance/index.controller';
import ConsignmentController from '../../controllers/finance/consignment.controller';
import { TransactionController } from '../../controllers/finance/transaction.controller';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // For password hashing


import express from 'express'
import { Request, Response } from 'express';
import authMiddleware from "../../middleware/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import customerRoutes from './customer.routes';
import transactionRoutes from './transaction.routes';
import companyRoutes from './company.routes';

const router = Router()
const { v4: uuidv4 } = require('uuid');

// Ensure the transferSlip directory exists
const transferSlipDir = 'public/images/transferSlip';
if (!fs.existsSync(transferSlipDir)) {
  fs.mkdirSync(transferSlipDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, transferSlipDir); // Store files in public/images/transferSlip
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`);
  }
});

var upload = multer({ storage: storage });
const financeController = new FinanceController();
const consignmentController = new ConsignmentController();
const transactionController = new TransactionController();

router.post('/record-money', authMiddleware, transactionController.createTransaction.bind(transactionController));

// Get all transactions
router.get('/record-money', authMiddleware, transactionController.getTransactions.bind(transactionController));

// Get transaction by ID
// router.get('/record-money/:id', verifyToken, transactionController.getTransactionById.bind(transactionController));

// Employee routes
// router.get('/employee/role/salesupport', authMiddleware, (req, res) => employeeController.getSalesSupportEmployees(req, res));

// // Update transaction
// router.put('/record-money/:id', verifyToken, transactionController.updateTransaction.bind(transactionController));

// Delete transaction
router.delete('/record-money/:id', authMiddleware, transactionController.deleteTransaction.bind(transactionController));


router.get('/getPurchase', authMiddleware,(req, res) =>  financeController.getPurchase(req, res));
router.get('/getPurchaseById/:id',authMiddleware, (req, res) =>  financeController.getPurchaseById(req, res));


router.get('/getWidhdrawalInformationByShipmentNumber/:id',authMiddleware, (req, res) =>  financeController.getWidhdrawalInformationByShipmentNumber(req, res));
router.get('/getWorkByid/:id',authMiddleware, (req, res) =>  financeController.getWorkByid(req, res));

router.get('/customer-accounts', authMiddleware, (req, res) => financeController.getCustomerAccounts(req, res));
router.get('/company-accounts', authMiddleware, (req, res) => financeController.getCompanyAccounts(req, res));

router.post('/submitPurchase',authMiddleware, (req, res) =>  financeController.submitPurchase(req, res));
router.put('/updatePurchase/:id',authMiddleware, (req, res) =>  financeController.updatePurchase(req, res));


//
router.get('/purchase',authMiddleware, (req, res) =>  financeController.getPurchaseBySearch(req, res));
router.get('/getWidhdrawalInformation',authMiddleware, (req, res) =>  financeController.getWidhdrawalInformation(req, res));
router.get('/withdrawal_information/group/:groupId',authMiddleware, (req, res) =>  financeController.getWidhdrawalInformationByGroupId(req, res));
router.post('/submitwidhdrawalInformation',authMiddleware, (req, res) =>  financeController.submitWidhdrawalInformation(req, res));
router.post('/updatewidhdrawalInformation',authMiddleware, (req, res) =>  financeController.updateWidhdrawalInformation(req, res));

router.delete('/withdrawal_information/:id',authMiddleware, (req, res) =>  financeController.deleteWithdrawalInformation(req, res));
router.delete('/withdrawal_information/group/:groupId',authMiddleware, (req, res) =>  financeController.deleteWithdrawalInformationByGroupId(req, res));

// Transaction routes
router.use('/record-money', transactionRoutes);
router.use('/customer', customerRoutes);
router.use('/company', companyRoutes);

// Financial Record Routes
router.post('/financial-records', authMiddleware, upload.single('transferSlip'), (req, res) => financeController.createFinancialRecord(req, res));
router.get('/financial-records', authMiddleware, (req, res) => financeController.getFinancialRecords(req, res));
router.get('/financial-records/:id', authMiddleware, (req, res) => financeController.getFinancialRecordById(req, res));
router.put('/financial-records/:id', authMiddleware, upload.single('transferSlip'), (req, res) => financeController.updateFinancialRecord(req, res));
router.delete('/financial-records/:id', authMiddleware, (req, res) => financeController.deleteFinancialRecord(req, res));

// Export financial records to Excel
router.get('/export-excel', authMiddleware, (req, res) => financeController.exportFinancialRecordsToExcel(req, res));

// Export withdrawal information to Excel
router.get('/export-withdrawal-excel', authMiddleware, (req, res) => financeController.exportWithdrawalInformationToExcel(req, res));

// Export finance work data to Excel
router.get('/export-finance-work', authMiddleware, (req, res) => financeController.exportFinanceWorkToExcel(req, res));

// Consignment Routes
router.post('/consignments', authMiddleware, (req, res) => consignmentController.createConsignment(req, res));
router.get('/consignments', authMiddleware, (req, res) => consignmentController.getConsignments(req, res));
router.get('/consignments/:id', authMiddleware, (req, res) => consignmentController.getConsignmentById(req, res));
router.put('/consignments/:id', authMiddleware, (req, res) => consignmentController.updateConsignment(req, res));
router.delete('/consignments/:id', authMiddleware, (req, res) => consignmentController.deleteConsignment(req, res));

module.exports = router