import express from "express";
import { saveTransferCommission, getTransferCommission, updateCommissionStatus, getCommissionSummary, exportCommissionSummary } from "../../controllers/hr/transfer-commission.controller";
import authMiddleware from "../../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware
router.use(authMiddleware);

// Routes
router.post("/", saveTransferCommission);
router.get("/summary", getCommissionSummary);
router.get("/export", exportCommissionSummary);
router.get("/:transferId", getTransferCommission);
router.put("/:commissionId/status", updateCommissionStatus);

export default router;
