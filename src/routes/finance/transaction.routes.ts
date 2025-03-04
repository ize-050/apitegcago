import express from 'express';
import { TransactionController } from '../../controllers/finance/transaction.controller';
import authMiddleware from "../../middleware/authMiddleware";

const router = express.Router();
const transactionController = new TransactionController();

// Create a new transaction
router.post('/record-money', authMiddleware, transactionController.createTransaction.bind(transactionController));

// Get all transactions
router.get('/record-money', authMiddleware, transactionController.getTransactions.bind(transactionController));

// Get transaction by ID
// router.get('/record-money/:id', verifyToken, transactionController.getTransactionById.bind(transactionController));

// // Update transaction
// router.put('/record-money/:id', verifyToken, transactionController.updateTransaction.bind(transactionController));

// Delete transaction
router.delete('/record-money/:id', authMiddleware, transactionController.deleteTransaction.bind(transactionController));

export default router;
