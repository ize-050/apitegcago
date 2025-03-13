import express from "express";
import {
  getAllTransferTypes,
  getTransferTypeById,
  createTransferType,
  updateTransferType,
  deleteTransferType
} from "../../controllers/hr/transfer-types.controller";

const router = express.Router();

// Get all transfer types
router.get("/", getAllTransferTypes);

// Get a single transfer type by ID
router.get("/:id", getTransferTypeById);

// Create a new transfer type
router.post("/", createTransferType);

// Update a transfer type
router.put("/:id", updateTransferType);

// Delete a transfer type
router.delete("/:id", deleteTransferType);

export default router;
