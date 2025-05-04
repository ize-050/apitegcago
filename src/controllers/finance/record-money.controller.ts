import { Request, Response } from 'express';
import { RecordMoneyRepository } from '../../repository/finance/record-money.repository';
import path from 'path';
import fs from 'fs';
import FinanceRepository from '../../repository/finance/index.repository';

export class RecordMoneyController {
  private financeRepository: RecordMoneyRepository;

  constructor() {
    this.financeRepository = new RecordMoneyRepository();
  }

  /**
   * ดึงข้อมูลรายการเงินทั้งหมด
   */
  getAllRecords = async (req: Request, res: Response) => {
    try {
      const records = await this.financeRepository.getAllRecordMoney();
      return res.status(200).json({
        statusCode: 200,
        message: 'ดึงข้อมูลรายการเงินทั้งหมดสำเร็จ',
        data: records
      });
    } catch (error: any) {
      console.error('Error in getAllRecords:', error);
      return res.status(500).json({
        statusCode: 500,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการเงิน',
        error: error.message
      });
    }
  };

  /**
   * ดึงข้อมูลรายการเงินตาม ID
   */
  getRecordById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const record = await this.financeRepository.getRecordMoneyById(id);
      
      if (!record) {
        return res.status(404).json({
          statusCode: 404,
          message: 'ไม่พบข้อมูลรายการเงินที่ต้องการ'
        });
      }
      
      return res.status(200).json({
        statusCode: 200,
        message: 'ดึงข้อมูลรายการเงินสำเร็จ',
        data: record
      });
    } catch (error: any) {
      console.error('Error in getRecordById:', error);
      return res.status(500).json({
        statusCode: 500,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการเงิน',
        error: error.message
      });
    }
  };

  /**
   * สร้างรายการเงินใหม่
   */
  createRecord = async (req: Request, res: Response) => {
    try {
      const recordData = req.body;
      const newRecord = await this.financeRepository.createRecordMoney(recordData);
      
      return res.status(201).json({
        statusCode: 201,
        message: 'สร้างรายการเงินสำเร็จ',
        data: newRecord
      });
    } catch (error: any) {
      console.error('Error in createRecord:', error);
      return res.status(500).json({
        statusCode: 500,
        message: 'เกิดข้อผิดพลาดในการสร้างรายการเงิน',
        error: error.message
      });
    }
  };

  /**
   * สร้างรายการเงินใหม่พร้อมอัพโหลดไฟล์
   */
  createRecordWithFile = async (req: Request, res: Response) => {
    try {
      // ตรวจสอบว่ามีไฟล์ที่อัพโหลดหรือไม่
      if (!req.file) {
        return res.status(400).json({
          statusCode: 400,
          message: 'ไม่พบไฟล์ที่อัพโหลด'
        });
      }

      // ตรวจสอบว่ามีข้อมูลรายการเงินหรือไม่
      if (!req.body.data) {
        // ลบไฟล์ที่อัพโหลดเพื่อไม่ให้เปลืองพื้นที่
        fs.unlinkSync(req.file.path);
        
        return res.status(400).json({
          statusCode: 400,
          message: 'ไม่พบข้อมูลรายการเงิน'
        });
      }

      // แปลงข้อมูลจาก JSON string เป็น object
      const recordData = JSON.parse(req.body.data);
      
      // เพิ่ม URL ของไฟล์ที่อัพโหลดลงในข้อมูลรายการเงิน
      const fileUrl = `/uploads/record-money/${path.basename(req.file.path)}`;
      recordData.transferSlipUrl = fileUrl;
      
      // บันทึกข้อมูลลงฐานข้อมูล
      const newRecord = await this.financeRepository.createRecordMoney(recordData);
      
      return res.status(201).json({
        statusCode: 201,
        message: 'สร้างรายการเงินและอัพโหลดไฟล์สำเร็จ',
        data: newRecord,
        file: {
          url: fileUrl,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error: any) {
      console.error('Error in createRecordWithFile:', error);
      
      // ถ้ามีไฟล์ที่อัพโหลดแล้วเกิดข้อผิดพลาด ให้ลบไฟล์นั้นทิ้ง
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
      
      return res.status(500).json({
        statusCode: 500,
        message: 'เกิดข้อผิดพลาดในการสร้างรายการเงินและอัพโหลดไฟล์',
        error: error.message
      });
    }
  };

  /**
   * อัปเดตรายการเงิน
   */
  updateRecord = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const recordData = req.body;
      
      // ตรวจสอบว่ารายการเงินที่ต้องการอัปเดตมีอยู่หรือไม่
      const existingRecord = await this.financeRepository.getRecordMoneyById(id);
      if (!existingRecord) {
        return res.status(404).json({
          statusCode: 404,
          message: 'ไม่พบรายการเงินที่ต้องการอัปเดต'
        });
      }
      
      // อัปเดตรายการเงิน
      const updatedRecord = await this.financeRepository.updateRecordMoney(id, recordData);
      
      return res.status(200).json({
        statusCode: 200,
        message: 'อัปเดตรายการเงินสำเร็จ',
        data: updatedRecord
      });
    } catch (error: any) {
      console.error('Error in updateRecord:', error);
      return res.status(500).json({
        statusCode: 500,
        message: 'เกิดข้อผิดพลาดในการอัปเดตรายการเงิน',
        error: error.message
      });
    }
  };

  /**
   * อัปเดตรายการเงินพร้อมอัพโหลดไฟล์
   */
  updateRecordWithFile = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // ตรวจสอบว่ามีไฟล์ที่อัพโหลดหรือไม่
      if (!req.file) {
        return res.status(400).json({
          statusCode: 400,
          message: 'ไม่พบไฟล์ที่อัพโหลด'
        });
      }

      // ตรวจสอบว่ามีข้อมูลรายการเงินหรือไม่
      if (!req.body.data) {
        // ลบไฟล์ที่อัพโหลดเพื่อไม่ให้เปลืองพื้นที่
        fs.unlinkSync(req.file.path);
        
        return res.status(400).json({
          statusCode: 400,
          message: 'ไม่พบข้อมูลรายการเงิน'
        });
      }

      // แปลงข้อมูลจาก JSON string เป็น object
      const recordData = JSON.parse(req.body.data);
      
      // ตรวจสอบว่ารายการเงินที่ต้องการอัปเดตมีอยู่หรือไม่
      const existingRecord = await this.financeRepository.getRecordMoneyById(id);
      if (!existingRecord) {
        // ลบไฟล์ที่อัพโหลดเพื่อไม่ให้เปลืองพื้นที่
        fs.unlinkSync(req.file.path);
        
        return res.status(404).json({
          statusCode: 404,
          message: 'ไม่พบรายการเงินที่ต้องการอัปเดต'
        });
      }
      
      // ลบไฟล์เก่าถ้ามี
      // if (existingRecord.transferSlipUrl) {
      //   const oldFilePath = path.join(__dirname, '../../public', existingRecord.transferSlipUrl);
      //   if (fs.existsSync(oldFilePath)) {
      //     try {
      //       fs.unlinkSync(oldFilePath);
      //     } catch (unlinkError) {
      //       console.error('Error deleting old file:', unlinkError);
      //     }
      //   }
      // }
      
      // เพิ่ม URL ของไฟล์ที่อัพโหลดลงในข้อมูลรายการเงิน
      const fileUrl = `/uploads/record-money/${path.basename(req.file.path)}`;
      recordData.transferSlipUrl = fileUrl;
      
      // อัปเดตรายการเงิน
      const updatedRecord = await this.financeRepository.updateRecordMoney(id, recordData);
      
      return res.status(200).json({
        statusCode: 200,
        message: 'อัปเดตรายการเงินและอัพโหลดไฟล์สำเร็จ',
        data: updatedRecord,
        file: {
          url: fileUrl,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error: any) {
      console.error('Error in updateRecordWithFile:', error);
      
      // ถ้ามีไฟล์ที่อัพโหลดแล้วเกิดข้อผิดพลาด ให้ลบไฟล์นั้นทิ้ง
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
      
      return res.status(500).json({
        statusCode: 500,
        message: 'เกิดข้อผิดพลาดในการอัปเดตรายการเงินและอัพโหลดไฟล์',
        error: error.message
      });
    }
  };

  /**
   * ลบรายการเงิน
   */
  deleteRecord = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // ตรวจสอบว่ารายการเงินที่ต้องการลบมีอยู่หรือไม่
      const existingRecord = await this.financeRepository.getRecordMoneyById(id);
      if (!existingRecord) {
        return res.status(404).json({
          statusCode: 404,
          message: 'ไม่พบรายการเงินที่ต้องการลบ'
        });
      }
      
      // ลบไฟล์หลักฐานการโอนถ้ามี
      // if (existingRecord.transferSlipUrl) {
      //   const filePath = path.join(__dirname, '../../public', existingRecord.transferSlipUrl);
      //   if (fs.existsSync(filePath)) {
      //     try {
      //       fs.unlinkSync(filePath);
      //     } catch (unlinkError) {
      //       console.error('Error deleting file:', unlinkError);
      //     }
      //   }
      // }
      
      // ลบรายการเงิน
      await this.financeRepository.deleteRecordMoney(id);
      
      return res.status(200).json({
        statusCode: 200,
        message: 'ลบรายการเงินสำเร็จ'
      });
    } catch (error: any) {
      console.error('Error in deleteRecord:', error);
      return res.status(500).json({
        statusCode: 500,
        message: 'เกิดข้อผิดพลาดในการลบรายการเงิน',
        error: error.message
      });
    }
  };
}
