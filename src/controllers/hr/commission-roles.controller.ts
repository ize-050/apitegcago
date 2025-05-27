import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { Decimal } from "@prisma/client/runtime/library";

interface CommissionRole {
  id?: string;
  role_name: string;
  commission_percentage: number | Decimal;
  description?: string | null;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// GET: ดึงข้อมูลค่าคอมมิชชั่นตามบทบาททั้งหมด
export const getAllCommissionRoles = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    const commissionRoles = await prisma.commission_role.findMany({
      orderBy: {
        role_name: 'asc'
      }
    });
    
    return res.status(200).json(commissionRoles);
  } catch (error) {
    console.error("Error fetching commission roles:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลค่าคอมมิชชั่นตามบทบาท" });
  }
};

// GET: ดึงข้อมูลค่าคอมมิชชั่นตามบทบาทตาม ID
export const getCommissionRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prisma = new PrismaClient();
    
    const commissionRole = await prisma.commission_role.findUnique({
      where: { id }
    });
    
    if (!commissionRole) {
      return res.status(404).json({ message: "ไม่พบข้อมูลค่าคอมมิชชั่นตามบทบาทที่ระบุ" });
    }
    
    return res.status(200).json(commissionRole);
  } catch (error) {
    console.error("Error fetching commission role:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลค่าคอมมิชชั่นตามบทบาท" });
  }
};

// POST: สร้างข้อมูลค่าคอมมิชชั่นตามบทบาทใหม่
export const createCommissionRole = async (req: Request, res: Response) => {
  try {
    const { role_name, commission_percentage, description, is_active } = req.body;
    
    if (!role_name || commission_percentage === undefined) {
      return res.status(400).json({ message: "กรุณาระบุชื่อบทบาทและเปอร์เซ็นต์ค่าคอมมิชชั่น" });
    }
    
    if (commission_percentage < 0 || commission_percentage > 100) {
      return res.status(400).json({ message: "เปอร์เซ็นต์ค่าคอมมิชชั่นต้องอยู่ระหว่าง 0-100" });
    }
    
    const prisma = new PrismaClient();
    
    // ตรวจสอบว่ามีบทบาทนี้อยู่แล้วหรือไม่
    const existingRole = await prisma.commission_role.findFirst({
      where: { role_name }
    });
    
    if (existingRole) {
      return res.status(400).json({ message: "มีบทบาทนี้อยู่ในระบบแล้ว" });
    }
    
    const newCommissionRole = await prisma.commission_role.create({
      data: {
        role_name,
        commission_percentage: parseFloat(commission_percentage.toString()),
        description: description || "",
        is_active: is_active !== undefined ? is_active : true
      }
    });
    
    return res.status(201).json(newCommissionRole);
  } catch (error) {
    console.error("Error creating commission role:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างข้อมูลค่าคอมมิชชั่นตามบทบาท" });
  }
};

// PUT: อัปเดตข้อมูลค่าคอมมิชชั่นตามบทบาท
export const updateCommissionRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role_name, commission_percentage, description, is_active } = req.body;
    
    if (!role_name || commission_percentage === undefined) {
      return res.status(400).json({ message: "กรุณาระบุชื่อบทบาทและเปอร์เซ็นต์ค่าคอมมิชชั่น" });
    }
    
    if (commission_percentage < 0 || commission_percentage > 100) {
      return res.status(400).json({ message: "เปอร์เซ็นต์ค่าคอมมิชชั่นต้องอยู่ระหว่าง 0-100" });
    }
    
    const prisma = new PrismaClient();
    
    // ตรวจสอบว่ามีข้อมูลที่ต้องการอัปเดตหรือไม่
    const existingRole = await prisma.commission_role.findUnique({
      where: { id }
    });
    
    if (!existingRole) {
      return res.status(404).json({ message: "ไม่พบข้อมูลค่าคอมมิชชั่นตามบทบาทที่ต้องการอัปเดต" });
    }
    
    // ตรวจสอบว่ามีบทบาทอื่นที่ใช้ชื่อเดียวกันหรือไม่
    const duplicateRole = await prisma.commission_role.findFirst({
      where: { 
        role_name,
        id: { not: id }
      }
    });
    
    if (duplicateRole) {
      return res.status(400).json({ message: "มีบทบาทนี้อยู่ในระบบแล้ว" });
    }
    
    const updatedCommissionRole = await prisma.commission_role.update({
      where: { id },
      data: {
        role_name,
        commission_percentage: parseFloat(commission_percentage.toString()),
        description: description || "",
        is_active: is_active !== undefined ? is_active : true
      }
    });
    
    return res.status(200).json(updatedCommissionRole);
  } catch (error) {
    console.error("Error updating commission role:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลค่าคอมมิชชั่นตามบทบาท" });
  }
};

// DELETE: ลบข้อมูลค่าคอมมิชชั่นตามบทบาท
export const deleteCommissionRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prisma = new PrismaClient();
    
    // ตรวจสอบว่ามีข้อมูลที่ต้องการลบหรือไม่
    const existingRole = await prisma.commission_role.findUnique({
      where: { id }
    });
    
    if (!existingRole) {
      return res.status(404).json({ message: "ไม่พบข้อมูลค่าคอมมิชชั่นตามบทบาทที่ต้องการลบ" });
    }
    
    await prisma.commission_role.delete({
      where: { id }
    });
    
    return res.status(200).json({ message: "ลบข้อมูลค่าคอมมิชชั่นตามบทบาทเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Error deleting commission role:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลค่าคอมมิชชั่นตามบทบาท" });
  }
};

// POST: บันทึกข้อมูลค่าคอมมิชชั่นตามบทบาทหลายรายการพร้อมกัน
export const batchUpdateCommissionRoles = async (req: Request, res: Response) => {
  try {
    const { roleCommissions } = req.body;
    
    if (!roleCommissions || !Array.isArray(roleCommissions)) {
      return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
    }
    
    const prisma = new PrismaClient();
    const results: CommissionRole[] = [];
    
    // ใช้ transaction เพื่อให้การบันทึกข้อมูลทั้งหมดสำเร็จหรือล้มเหลวพร้อมกัน
    await prisma.$transaction(async (tx) => {
      for (const role of roleCommissions) {
        if (!role.role_name || role.commission_percentage === undefined) {
          throw new Error("กรุณาระบุชื่อบทบาทและเปอร์เซ็นต์ค่าคอมมิชชั่นให้ครบทุกรายการ");
        }
        
        if (role.commission_percentage < 0 || role.commission_percentage > 100) {
          throw new Error("เปอร์เซ็นต์ค่าคอมมิชชั่นต้องอยู่ระหว่าง 0-100");
        }
        
        let result;
        
        if (role.id) {
          // อัปเดตข้อมูลที่มีอยู่แล้ว
          result = await tx.commission_role.update({
            where: { id: role.id },
            data: {
              role_name: role.role_name,
              commission_percentage: parseFloat(role.commission_percentage.toString()),
              description: role.description || "",
              is_active: role.is_active !== undefined ? role.is_active : true
            }
          });
        } else {
          // สร้างข้อมูลใหม่
          result = await tx.commission_role.create({
            data: {
              role_name: role.role_name,
              commission_percentage: parseFloat(role.commission_percentage.toString()),
              description: role.description || "",
              is_active: role.is_active !== undefined ? role.is_active : true
            }
          });
        }
        
        results.push(result);
      }
    });
    
    return res.status(200).json(results);
  } catch (error) {
    console.error("Error batch updating commission roles:", error);
    return res.status(500).json({ message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูลค่าคอมมิชชั่นตามบทบาท" });
  }
};
