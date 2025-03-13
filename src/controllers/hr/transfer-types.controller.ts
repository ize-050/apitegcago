import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all transfer types
export const getAllTransferTypes = async (req: Request, res: Response) => {
  try {
    const transferTypes = await prisma.finance_transfer_type.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        type_name: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: transferTypes
    });
  } catch (error) {
    console.error("Error fetching transfer types:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transfer types",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get a single transfer type by ID
export const getTransferTypeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transferType = await prisma.finance_transfer_type.findUnique({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!transferType) {
      return res.status(404).json({
        success: false,
        message: "Transfer type not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: transferType
    });
  } catch (error) {
    console.error("Error fetching transfer type:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transfer type",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Create a new transfer type
export const createTransferType = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { type_name, is_active } = req.body;
    const commission_rate = req.body.commission_rate || 0;

    if (!type_name) {
      return res.status(400).json({
        success: false,
        message: "Type name is required",
      });
    }

    try {
      // Check if a transfer type with the same name already exists
      const existingTransferType = await prisma.finance_transfer_type.findFirst({
        where: {
          type_name: type_name,
          deletedAt: null,
        },
      });

      if (existingTransferType) {
        return res.status(400).json({
          success: false,
          message: "A transfer type with this name already exists",
        });
      }

      // Create new transfer type
      const transferType = await prisma.finance_transfer_type.create({
        data: {
          type_name,
          commission_rate: parseFloat(commission_rate.toString()),
          is_active: is_active !== undefined ? is_active : true,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Transfer type created successfully",
        data: transferType
      });
    } catch (error) {
      console.error("Error creating transfer type:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create transfer type",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error("Error creating transfer type:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create transfer type",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Update a transfer type
export const updateTransferType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Validate request body
    const { type_name, is_active } = req.body;
    const commission_rate = req.body.commission_rate || 0;

    if (!type_name) {
      return res.status(400).json({
        success: false,
        message: "Type name is required",
      });
    }

    try {
      // Check if the transfer type exists
      const existingTransferType = await prisma.finance_transfer_type.findFirst({
        where: {
          id: id,
          deletedAt: null,
        },
      });

      if (!existingTransferType) {
        return res.status(404).json({
          success: false,
          message: "Transfer type not found",
        });
      }

      // Check if another transfer type with the same name exists (excluding the current one)
      const duplicateNameCheck = await prisma.finance_transfer_type.findFirst({
        where: {
          type_name: type_name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (duplicateNameCheck) {
        return res.status(400).json({
          success: false,
          message: "Another transfer type with this name already exists",
        });
      }

      // Update transfer type
      const updatedTransferType = await prisma.finance_transfer_type.update({
        where: { id: id },
        data: {
          type_name,
          commission_rate: parseFloat(commission_rate.toString()),
          is_active: is_active !== undefined ? is_active : true,
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({
        success: true,
        message: "Transfer type updated successfully",
        data: updatedTransferType
      });
    } catch (error) {
      console.error("Error updating transfer type:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update transfer type",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error("Error updating transfer type:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update transfer type",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Delete a transfer type (soft delete)
export const deleteTransferType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if transfer type exists
    const existingType = await prisma.finance_transfer_type.findUnique({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!existingType) {
      return res.status(404).json({
        success: false,
        message: "Transfer type not found"
      });
    }

    // Soft delete the transfer type
    await prisma.finance_transfer_type.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        is_active: false
      }
    });

    return res.status(200).json({
      success: true,
      message: "Transfer type deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting transfer type:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete transfer type",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
