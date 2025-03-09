import express from 'express';
import { FinanceCustomerController } from '../../controllers/finance/customer.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();
const controller = new FinanceCustomerController();

router.get('/', authMiddleware, controller.getAll);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

export default router;
