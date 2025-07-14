import express from "express";
import {
  saveTransferCommission,
  getTransferCommission,
  getCommissionById,
  updateCommissionStatus,
  updateCommissionAmount,
  getCommissionSummary,
  exportCommissionSummary,
  bulkCalculateTransferCommission,
  bulkUpdateCommissionStatus,
  getTransferTypes,
} from "../../controllers/hr/transfer-commission.controller";
import authMiddleware from "../../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware
router.use(authMiddleware);

// Routes - put more specific routes first
router.post("/", saveTransferCommission);
router.post("/bulk-calculate", bulkCalculateTransferCommission);
router.put("/bulk-status", bulkUpdateCommissionStatus);
router.get("/types", getTransferTypes);
router.get("/summary", getCommissionSummary);
router.get("/export", exportCommissionSummary);
router.get("/commission/:commissionId", getCommissionById);
router.put("/:commissionId/status", updateCommissionStatus);
router.put("/:commissionId/amount", updateCommissionAmount);
router.get("/:transferId", getTransferCommission);

export default router;
