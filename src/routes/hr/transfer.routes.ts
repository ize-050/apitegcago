import { Router } from "express";
import { 
  getAllTransfers, 
  getSalesSupportEmployees,
  updateTransfer,
  getTransferById
} from "../../controllers/hr/transfer.controller";
import authMiddleware from "../../middleware/authMiddleware";

const router = Router();

// Get all transfer data with pagination and filters
router.get("/", authMiddleware, getAllTransfers);

// Get single transfer by ID
router.get("/:id", authMiddleware, getTransferById);

// Update transfer data
router.put("/:id", authMiddleware, updateTransfer);

// Get sales support employees
router.get("/salesupport/employees", authMiddleware, getSalesSupportEmployees);

export default router;
