import { Request, Response } from "express";
import ConsignmentService from "../../services/finance/consignment.service";
import { ConsignmentCreateDto, ConsignmentType, ConsignmentUpdateDto } from "../../services/finance/dto/consignment.interface";

class ConsignmentController {
    private consignmentService: ConsignmentService;

    constructor() {
        this.consignmentService = new ConsignmentService();
    }

    public async createConsignment(req: Request, res: Response) {
        try {
            const data = req.body;
            
            // Validate required fields
            const requiredFields = ['date', 'salespersonId', 'documentNumber', 'customerId', 'type', 'amountRMB', 'transferDate'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    return res.status(400).json({
                        message: `กรุณาระบุ ${field}`,
                        statusCode: 400
                    });
                }
            }
            
            // Validate type
            if (!Object.values(ConsignmentType).includes(data.type)) {
                return res.status(400).json({
                    message: "ประเภทรายการไม่ถูกต้อง",
                    statusCode: 400
                });
            }
            
            // Validate numeric fields
            try {
                if (data.amountRMB) {
                    data.amountRMB = parseFloat(data.amountRMB);
                    if (isNaN(data.amountRMB)) {
                        throw new Error("จำนวนเงิน RMB ไม่ถูกต้อง");
                    }
                }
            } catch (error:any) {
                return res.status(400).json({
                    message: error.message || "ข้อมูลตัวเลขไม่ถูกต้อง",
                    statusCode: 400
                });
            }
            
            // Additional validation for specific types
            if (data.type === ConsignmentType.ORDER) {
                if (!data.productDetails) {
                    return res.status(400).json({
                        message: "กรุณาระบุรายละเอียดสินค้า",
                        statusCode: 400
                    });
                }
            } else if (data.type === ConsignmentType.TOPUP) {
                if (!data.topupPlatform || !data.topupAccount) {
                    return res.status(400).json({
                        message: "กรุณาระบุแพลตฟอร์มและบัญชีที่เติมเงิน",
                        statusCode: 400
                    });
                }
            }
            
            const record = await this.consignmentService.createConsignment(data as ConsignmentCreateDto);
            
            const response = {
                data: record,
                message: "บันทึกข้อมูลสำเร็จ",
                statusCode: 201
            };
            
            return res.status(201).json(response);
        } catch (err: any) {
            console.log('Error creating consignment record', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
                error: err.message,
                statusCode: 500
            });
        }
    }
    
    public async getConsignments(req: Request, res: Response) {
        try {
            const filters = req.query;
            const records = await this.consignmentService.getConsignments(filters);
            
            const response = {
                data: records,
                message: "ดึงข้อมูลสำเร็จ",
                statusCode: 200
            };
            
            return res.status(200).json(response);
        } catch (err: any) {
            console.log('Error getting consignment records', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
                error: err.message,
                statusCode: 500
            });
        }
    }
    
    public async getConsignmentById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    message: "กรุณาระบุ ID",
                    statusCode: 400
                });
            }
            
            const record = await this.consignmentService.getConsignmentById(id);
            
            if (!record) {
                return res.status(404).json({
                    message: "ไม่พบข้อมูล",
                    statusCode: 404
                });
            }
            
            const response = {
                data: record,
                message: "ดึงข้อมูลสำเร็จ",
                statusCode: 200
            };
            
            return res.status(200).json(response);
        } catch (err: any) {
            console.log('Error getting consignment record by ID', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
                error: err.message,
                statusCode: 500
            });
        }
    }
    
    public async updateConsignment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = req.body;
            
            if (!id) {
                return res.status(400).json({
                    message: "กรุณาระบุ ID",
                    statusCode: 400
                });
            }
            
            // Validate numeric fields if provided
            try {
                if (data.amountRMB) {
                    data.amountRMB = parseFloat(data.amountRMB);
                    if (isNaN(data.amountRMB)) {
                        throw new Error("จำนวนเงิน RMB ไม่ถูกต้อง");
                    }
                }
            } catch (error:any) {
                return res.status(400).json({
                    message: error.message || "ข้อมูลตัวเลขไม่ถูกต้อง",
                    statusCode: 400
                });
            }
            
            // Check if record exists
            const existingRecord = await this.consignmentService.getConsignmentById(id);
            
            if (!existingRecord) {
                return res.status(404).json({
                    message: "ไม่พบข้อมูล",
                    statusCode: 404
                });
            }
            
            const record = await this.consignmentService.updateConsignment(id, data as ConsignmentUpdateDto);
            
            const response = {
                data: record,
                message: "อัปเดตข้อมูลสำเร็จ",
                statusCode: 200
            };
            
            return res.status(200).json(response);
        } catch (err: any) {
            console.log('Error updating consignment record', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
                error: err.message,
                statusCode: 500
            });
        }
    }
    
    public async deleteConsignment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    message: "กรุณาระบุ ID",
                    statusCode: 400
                });
            }
            
            // Check if record exists
            const existingRecord = await this.consignmentService.getConsignmentById(id);
            
            if (!existingRecord) {
                return res.status(404).json({
                    message: "ไม่พบข้อมูล",
                    statusCode: 404
                });
            }
            
            await this.consignmentService.deleteConsignment(id);
            
            const response = {
                message: "ลบข้อมูลสำเร็จ",
                statusCode: 200
            };
            
            return res.status(200).json(response);
        } catch (err: any) {
            console.log('Error deleting consignment record', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการลบข้อมูล",
                error: err.message,
                statusCode: 500
            });
        }
    }
}

export default ConsignmentController;
