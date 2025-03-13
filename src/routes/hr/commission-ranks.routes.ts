import express from "express";
import { 
  getCommissionRanks, 
  saveCommissionRanks,
  calculateCommission,
  submitCommission,
  getCsDepartmentCommissions,
  updateCsCommissionStatus,
  checkCommissionStatus,
  getEmployeeCommissions,
  getCsCommission,
  getCommissionSummaryForExport
} from "../../controllers/hr/commission-ranks.controller";

const router = express.Router();

// Get all commission ranks
router.get("/", getCommissionRanks);

// Save commission ranks
router.post("/", saveCommissionRanks);

// Calculate commission based on profit amount
router.post("/calculate", calculateCommission);

// Submit commission data
router.post("/submit", submitCommission);

// CS Department Commission routes
router.get("/cs-commissions", getCsDepartmentCommissions);
router.patch("/cs-commissions/:id", updateCsCommissionStatus);

// Check commission status for a purchase
router.get("/status/:purchaseId", checkCommissionStatus);

// Get employee commissions for a specific purchase
router.get("/employee-commissions/:purchaseId", getEmployeeCommissions);

// Get CS department commission for a specific purchase
router.get("/cs-commission/:purchaseId", getCsCommission);

// Get commission summary for export
router.get("/export", getCommissionSummaryForExport);

export default router;
