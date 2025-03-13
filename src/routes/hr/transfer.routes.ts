import express from "express";
import { getAllTransfers, getSalesSupportEmployees } from "../../controllers/hr/transfer.controller";

const router = express.Router();

// Get all transfer data with pagination and filters
router.get("/", getAllTransfers);

// Get employees with salesupport role
router.get("/employees/salesupport", getSalesSupportEmployees);

export default router;
