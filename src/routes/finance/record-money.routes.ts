import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { RecordMoneyController } from '../../controllers/finance/record-money.controller';

const router = express.Router();
const recordMoneyController = new RecordMoneyController();

// กำหนดที่เก็บไฟล์และชื่อไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // กำหนด path ที่จะเก็บไฟล์
    const uploadDir = path.join(__dirname, '../../public/uploads/record-money');
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // กำหนดชื่อไฟล์เป็น timestamp + uuid + นามสกุลไฟล์เดิม
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// กำหนด filter สำหรับไฟล์ที่อนุญาตให้อัพโหลด
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // อนุญาตเฉพาะไฟล์รูปภาพ
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('ไม่อนุญาตให้อัพโหลดไฟล์ประเภทนี้ อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น'));
  }
};

// สร้าง multer instance
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // จำกัดขนาดไฟล์ไม่เกิน 5MB
  }
});

// เส้นทาง API ปกติ
router.get('/', recordMoneyController.getAllRecords);
router.get('/:id', recordMoneyController.getRecordById);
router.post('/', recordMoneyController.createRecord);
router.put('/:id', recordMoneyController.updateRecord);
router.delete('/:id', recordMoneyController.deleteRecord);

// เส้นทาง API สำหรับอัพโหลดไฟล์
router.post('/with-file', upload.single('file'), recordMoneyController.createRecordWithFile);
router.put('/:id/with-file', upload.single('file'), recordMoneyController.updateRecordWithFile);

export default router;
