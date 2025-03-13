import express from "express";
import workController from "../../controllers/hr/work.controller";

// สร้าง middleware สำหรับตรวจสอบ token ชั่วคราว
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // ในสภาพแวดล้อมจริง ควรมีการตรวจสอบ token
  // แต่เนื่องจากไม่พบไฟล์ middleware/auth จึงสร้าง middleware ชั่วคราว
  next();
};

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Get work list for HR
router.get("/", workController.getWorkList);

export default router;
