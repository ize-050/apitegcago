import express from "express";
import { 
  getAllCommissionRoles,
  getCommissionRoleById,
  createCommissionRole,
  updateCommissionRole,
  deleteCommissionRole,
  batchUpdateCommissionRoles
} from "../../controllers/hr/commission-roles.controller";

const router = express.Router();

// GET: ดึงข้อมูลค่าคอมมิชชั่นตามบทบาททั้งหมด
router.get("/", getAllCommissionRoles);

// GET: ดึงข้อมูลค่าคอมมิชชั่นตามบทบาทตาม ID
router.get("/:id", getCommissionRoleById);

// POST: สร้างข้อมูลค่าคอมมิชชั่นตามบทบาทใหม่
router.post("/", createCommissionRole);

// POST: บันทึกข้อมูลค่าคอมมิชชั่นตามบทบาทหลายรายการพร้อมกัน
router.post("/batch", batchUpdateCommissionRoles);

// PUT: อัปเดตข้อมูลค่าคอมมิชชั่นตามบทบาท
router.put("/:id", updateCommissionRole);

// DELETE: ลบข้อมูลค่าคอมมิชชั่นตามบทบาท
router.delete("/:id", deleteCommissionRole);

export default router;
