import express from "express";
import { 
  getCommissionRanks, 
  saveCommissionRanks,
  deleteCommissionRank,
  calculateCommission,
  submitCommission,
  getCsDepartmentCommissions,
  updateCsCommissionStatus,
  checkCommissionStatus,
  getEmployeeCommissions,
  getCsCommission,
  getCommissionSummaryForExport,
  getPurchaseCommissionStatus,
  exportCommissionData,
  bulkCalculateCommission
} from "../../controllers/hr/commission-ranks.controller";
import authMiddleware from "../../middleware/authMiddleware";

const router = express.Router();

// Get all commission ranks
router.get("/", getCommissionRanks);

// Save commission ranks
router.post("/", saveCommissionRanks);

// Delete a single commission rank
router.delete("/:id", authMiddleware, deleteCommissionRank);

// Calculate commission based on profit amount
router.post("/calculate", calculateCommission);

// Submit commission data
router.post("/submit", submitCommission);

// Bulk calculate commission for multiple purchases
router.post("/bulk-calculate", bulkCalculateCommission);

// CS Department Commission routes
router.get("/cs-commissions", getCsDepartmentCommissions);
router.patch("/cs-commissions/:id", updateCsCommissionStatus);

// Check commission status for a purchase
router.get("/status/:purchaseId", checkCommissionStatus);

// Get employee commissions for a specific purchase
router.get("/employee-commissions/:purchaseId", getEmployeeCommissions);

// Get CS department commission for a specific purchase
router.get("/cs-commission/:purchaseId", getCsCommission);

// Get commission status for a specific purchase (both employee and CS)
router.get("/purchase-commission-status/:purchaseId", getPurchaseCommissionStatus);

// Get commission summary for export
router.get("/export", getCommissionSummaryForExport);

// Export commission data with CS commission
router.get("/export-commission-data", exportCommissionData);

export default router;
