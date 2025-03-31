import { Request, Response } from "express";
import FinanceService from "../../services/finance/index.service";
import z from "zod";
import upload from "../../config/multerConfig";
import multer from "multer";
import moment from "moment";
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import FinanceRepository from "../../repository/finance/index.repository";

export class FinanceController {
    private financeService;

    constructor() {
        this.financeService = new FinanceService();
    }

    public async getPurchaseBySearch(req: Request, res: Response) {
        try {

            const { search }: any = req.query;

            const purchase = await this.financeService.getPurchasebySearch(search)
            const Response = {
                data: purchase,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async getPurchase(req: Request, res: Response) {
        try {
            const purchase = await this.financeService.getPurchase(req.query)

            const Response = {
                data: purchase,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async getPurchaseById(req: Request, res: Response) {
        try {
            console.log("id", req.params.id)
            const purchase = await this.financeService.getPurchaseById(req.params.id)
            const Response = {
                data: purchase,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async getWidhdrawalInformationByShipmentNumber(req: Request, res: Response) {
        try {
            const withdrawal = await this.financeService.getWidhdrawalInformationByShipmentNumber(req.params.id)
            const Response = {
                data: withdrawal,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async getWorkByid(req: Request, res: Response) {
        try {
            console.log("id", req.params.id)
            const finance_work = await this.financeService.getWorkByid(req.params.id)
            const Response = {
                data: finance_work,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async submitPurchase(req: Request, res: Response) {
        try {
            const purchase = await this.financeService.submitPurchase(req.body)
            const Response = {
                data: purchase,
                message: "บันทึกข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
                error: err.message,
                statusCode: 500
            })
        }
    }

    public async updatePurchase(req: Request, res: Response) {
        try {

            const id = req.params.id

            const purchase = await this.financeService.updatePurchase(id, req.body)
            const Response = {
                data: purchase,
                message: "แก้ไขข้อมูลสำเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    //work
    public async getWidhdrawalInformation(req: Request, res: Response) {
        try {

            const Request = {
                page: req.query.page,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            }
            const widhdrawalInformation = await this.financeService.getWidhdrawalInformation(Request)
            const Response = {
                data: widhdrawalInformation,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async getWidhdrawalInformationByGroupId(req: Request, res: Response): Promise<any> {
        try {
            const groupId = req.params.groupId;
            const data = await this.financeService.getWidhdrawalInformationByGroupId(groupId);
            return res.status(200).json({
                statusCode: 200,
                data: data,
                message: "Get withdrawal information by group ID successfully"
            });
        } catch (err: any) {
            console.log("errgetWidhdrawalInformationByGroupId", err);
            return res.status(500).json({
                statusCode: 500,
                message: err.message
            });
        }
    }

    public async submitWidhdrawalInformation(req: Request, res: Response) {
        try {
            for (let i = 0; i < req.body.length; i++) {
                const Check = await this.financeService.CheckWidhdrawalInformation(req.body[i])
                if (Check.length > 0) {
                    const Response = {
                        data: null,
                        message: "มีข้อมูล",
                        statusCode: 400
                    }
                    return res.status(200).json(Response);
                }
            }

            const widhdrawalInformation = await this.financeService.submitWidhdrawalInformation(req.body)
            const Response = {
                data: widhdrawalInformation,
                message: "ข้อมูลสําเร็จ",
                statusCode: 200
            }
            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error Notification', err)
            res.status(500).json(err)
        }
    }

    public async updateWidhdrawalInformation(req: Request, res: Response) {
        try {
            // ตรวจสอบว่ามีข้อมูล withdrawalItems หรือไม่
            if (!req.body.withdrawalItems || !Array.isArray(req.body.withdrawalItems) || req.body.withdrawalItems.length === 0) {
                return res.status(400).json({
                    data: null,
                    message: "ข้อมูลไม่ถูกต้อง กรุณาระบุรายการที่ต้องการแก้ไข",
                    statusCode: 400
                });
            }

            // ส่งข้อมูลไปยัง service เพื่อดำเนินการแก้ไข
            const widhdrawalInformation = await this.financeService.updateWidhdrawalInformation(req.body);

            // ส่งข้อมูลตอบกลับ
            const Response = {
                data: widhdrawalInformation,
                message: "แก้ไขข้อมูลสำเร็จ",
                statusCode: 200
            };

            return res.status(200).json(Response);
        }
        catch (err: any) {
            console.log('Error updateWidhdrawalInformation', err);
            return res.status(500).json({
                data: null,
                message: err.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล",
                statusCode: 500
            });
        }
    }

    public async deleteWithdrawalInformation(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.financeService.deleteWithdrawalInformation(id);
            return res.status(200).json({
                statusCode: 200,
                message: "Delete Withdrawal Information Successfully",
                data: result,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                statusCode: 500,
                message: "Internal Server Error",
            });
        }
    }

    public async deleteWithdrawalInformationByGroupId(req: Request, res: Response) {
        try {
            const { groupId } = req.params;

            if (!groupId) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Group ID is required",
                });
            }

            const result = await this.financeService.deleteWithdrawalInformationByGroupId(groupId);

            return res.status(200).json({
                statusCode: 200,
                message: "Delete Withdrawal Information Group Successfully",
                data: result,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                statusCode: 500,
                message: "Internal Server Error",
            });
        }
    }

    public async createFinancialRecord(req: Request, res: Response) {
        try {
            const data = req.body;

            // Handle file upload if there's a transfer slip
            if (req.file) {
                const transferSlip = req.file.filename;
                data.transferSlip = transferSlip;
            }

            // Validate required fields
            if (!data.date || !data.title || !data.accountOwner || !data.type || !data.amountRMB || !data.transferDate) {
                return res.status(400).json({
                    message: "กรุณากรอกข้อมูลให้ครบถ้วน",
                    statusCode: 400
                });
            }

            // Ensure numeric fields are valid numbers
            try {
                if (data.amountRMB) parseFloat(data.amountRMB);
                if (data.amountTHB) parseFloat(data.amountTHB);
                if (data.exchangeRate) parseFloat(data.exchangeRate);
            } catch (error) {
                return res.status(400).json({
                    message: "ข้อมูลตัวเลขไม่ถูกต้อง",
                    statusCode: 400
                });
            }

            const record = await this.financeService.createFinancialRecord(data);

            const response = {
                data: record,
                message: "บันทึกข้อมูลสำเร็จ",
                statusCode: 201
            };

            return res.status(201).json(response);
        } catch (err: any) {
            console.log('Error creating financial record', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
                error: err.message,
                statusCode: 500
            });
        }
    }

    public async getFinancialRecords(req: Request, res: Response) {
        try {
            const filters = req.query;
            const records = await this.financeService.getFinancialRecords(filters);

            const response = {
                data: records,
                message: "ดึงข้อมูลสำเร็จ",
                statusCode: 200
            };

            return res.status(200).json(response);
        } catch (err: any) {
            console.log('Error getting financial records', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
                error: err.message,
                statusCode: 500
            });
        }
    }

    public async getFinancialRecordById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const record = await this.financeService.getFinancialRecordById(id);

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
            console.log('Error getting financial record by ID', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
                error: err.message,
                statusCode: 500
            });
        }
    }

    public async updateFinancialRecord(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = req.body;

            // Handle file upload if there's a new transfer slip
            if (req.file) {
                const transferSlip = req.file.filename;
                data.transferSlip = transferSlip;
            }

            // Validate required fields
            if (!data.date || !data.title || !data.accountOwner || !data.type || !data.amountRMB || !data.transferDate) {
                return res.status(400).json({
                    message: "กรุณากรอกข้อมูลให้ครบถ้วน",
                    statusCode: 400
                });
            }

            // Ensure numeric fields are valid numbers
            try {
                if (data.amountRMB) parseFloat(data.amountRMB);
                if (data.amountTHB) parseFloat(data.amountTHB);
                if (data.exchangeRate) parseFloat(data.exchangeRate);
            } catch (error) {
                return res.status(400).json({
                    message: "ข้อมูลตัวเลขไม่ถูกต้อง",
                    statusCode: 400
                });
            }

            const record = await this.financeService.updateFinancialRecord(id, data);

            const response = {
                data: record,
                message: "อัปเดตข้อมูลสำเร็จ",
                statusCode: 200
            };

            return res.status(200).json(response);
        } catch (err: any) {
            console.log('Error updating financial record', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
                error: err.message,
                statusCode: 500
            });
        }
    }

    public async deleteFinancialRecord(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.financeService.deleteFinancialRecord(id);

            const response = {
                message: "ลบข้อมูลสำเร็จ",
                statusCode: 200
            };

            return res.status(200).json(response);
        } catch (err: any) {
            console.log('Error deleting financial record', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการลบข้อมูล",
                error: err.message,
                statusCode: 500
            });
        }
    }

    public async exportFinancialRecordsToExcel(req: Request, res: Response) {
        try {
            const filters: any = req.query;
            const financeRepository = new FinanceRepository();

            // Get all records without pagination for export
            const allFilters: any = { ...filters, page: 1, limit: 1000 };
            const result: any = await financeRepository.getFinancialRecords(allFilters);

            if (!result || !result) {
                return res.status(404).json({ message: 'No records found' });
            }

            const records: any[] = result;
            const accountOwner: any = filters.account || 'ALL';

            // Format month and year based on date filters
            let monthDisplay: string;
            let yearDisplay: any = new Date().getFullYear() + 543; // Default to current year in Buddhist Era

            if (filters.startDate && filters.endDate) {
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);

                // Get Thai month names
                const startMonthThai = startDate.toLocaleString('th-TH', { month: 'long' });
                const endMonthThai = endDate.toLocaleString('th-TH', { month: 'long' });

                // If same month, show just one month name
                if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
                    monthDisplay = startMonthThai;
                    yearDisplay = startDate.getFullYear() + 543; // Convert to Buddhist Era
                } else {
                    // If different months, show range
                    monthDisplay = `${startMonthThai} - ${endMonthThai}`;

                    // If different years, show range of years
                    if (startDate.getFullYear() !== endDate.getFullYear()) {
                        yearDisplay = `${startDate.getFullYear() + 543} - ${endDate.getFullYear() + 543}`;
                    } else {
                        yearDisplay = startDate.getFullYear() + 543;
                    }
                }
            } else if (filters.startDate) {
                // Only start date is provided
                const startDate = new Date(filters.startDate);
                monthDisplay = startDate.toLocaleString('th-TH', { month: 'long' });
                yearDisplay = startDate.getFullYear() + 543;
            } else if (filters.endDate) {
                // Only end date is provided
                const endDate = new Date(filters.endDate);
                monthDisplay = endDate.toLocaleString('th-TH', { month: 'long' });
                yearDisplay = endDate.getFullYear() + 543;
            } else {
                // No date filters, use current month
                monthDisplay = new Date().toLocaleString('th-TH', { month: 'long' });
            }

            // Create a new Excel workbook
            const workbook: any = new ExcelJS.Workbook();
            workbook.creator = 'Tegcago Financial System';
            workbook.lastModifiedBy = 'Tegcago';
            workbook.created = new Date();
            workbook.modified = new Date();

            // Add a worksheet
            const worksheet: any = workbook.addWorksheet('Financial Records', {
                pageSetup: {
                    paperSize: 9, // A4
                    orientation: 'portrait',
                    fitToPage: true
                }
            });

            // Set column widths without headers (we'll add headers manually)
            worksheet.columns = [
                { key: 'index', width: 10 },
                { key: 'date', width: 15 },
                { key: 'title', width: 30 },
                { key: 'details', width: 30 },
                { key: 'amountRMB', width: 15 },
                { key: 'exchangeRate', width: 15 },
                { key: 'amountTHB', width: 15 },
                { key: 'transferDate', width: 15 },
                { key: 'check', width: 10 },
            ];

            // Add title and header section
            const titleRow: any = worksheet.addRow(['สรุปรายเดือน']);
            titleRow.font = { bold: true, size: 16 };
            titleRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells(`A${titleRow.number}:I${titleRow.number}`);

            // Add account owner
            const accountRow: any = worksheet.addRow([]);
            accountRow.getCell(1).value = 'เจ้าของบัญชี';
            accountRow.getCell(2).value = accountOwner;
            accountRow.font = { bold: true };

            // Add month and year
            const monthRow: any = worksheet.addRow([]);
            monthRow.getCell(1).value = 'ประจำเดือน';
            monthRow.getCell(2).value = monthDisplay;
            monthRow.getCell(4).value = 'ปี';
            monthRow.getCell(5).value = yearDisplay.toString();

            // Style the month and year row
            monthRow.font = { bold: true };

            // Add filter information if filters were applied
            if (filters.startDate || filters.endDate) {
                const filterRow: any = worksheet.addRow([]);
                filterRow.getCell(1).value = 'ช่วงวันที่';

                let dateRangeText = '';
                if (filters.startDate && filters.endDate) {
                    const startDate = new Date(filters.startDate);
                    const endDate = new Date(filters.endDate);
                    dateRangeText = `${startDate.toLocaleDateString('th-TH')} ถึง ${endDate.toLocaleDateString('th-TH')}`;
                } else if (filters.startDate) {
                    const startDate = new Date(filters.startDate);
                    dateRangeText = `ตั้งแต่ ${startDate.toLocaleDateString('th-TH')}`;
                } else if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    dateRangeText = `ถึง ${endDate.toLocaleDateString('th-TH')}`;
                }

                filterRow.getCell(2).value = dateRangeText;
                filterRow.font = { bold: true };
            }

            if (filters.type && filters.type !== 'ALL') {
                const typeRow: any = worksheet.addRow([]);
                typeRow.getCell(1).value = 'ประเภท';
                typeRow.getCell(2).value = filters.type === 'RECEIPT' ? 'รายรับ' : 'รายจ่าย';
                typeRow.font = { bold: true };
            }

            // Add empty row for spacing
            worksheet.addRow([]);

            // Add header for receipt section with border and background
            const receiptTitleRow: any = worksheet.addRow([]);
            receiptTitleRow.getCell(1).value = 'ประเภท';
            receiptTitleRow.getCell(3).value = 'รับ';
            receiptTitleRow.font = { bold: true };

            // Style all cells in the receipt section
            const receiptHeaderRow: any = worksheet.addRow([
                'รายการที่',
                'วันที่ทำรายการ',
                'หัวข้อ',
                'รายละเอียด',
                'จำนวนเงิน (RMB)',
                'อัตราแลกเปลี่ยน',
                'จำนวนเงิน (THB)',
                'วันที่โอน',
                'ตรวจสอบ'
            ]);

            // Style the header row with borders and background
            receiptHeaderRow.eachCell((cell: any) => {
                cell.font = { bold: true };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE0E0E0' }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            });

            // Add receipt data with proper formatting
            let receiptIndex: number = 1;

            console.log("records111", records);
            const receiptRecords: any[] = records?.filter((record: any) => record.type === 'RECEIPT');

            receiptRecords.forEach((record: any) => {
                const row: any = worksheet.addRow([
                    receiptIndex++,
                    new Date(record.date).toLocaleDateString('th-TH'),
                    record.title,
                    record.details || '',
                    record.amountRMB,
                    record.exchangeRate || '',
                    record.amountTHB || '',
                    record.transferDate ? new Date(record.transferDate).toLocaleDateString('th-TH') : '',
                    record.transferSlip ? 'มีสลิป' : 'ไม่มีสลิป'
                ]);

                // Add borders to all cells in the row
                row.eachCell((cell: any) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });

                // Format number cells
                row.getCell(5).numFmt = '#,##0.00'; // RMB amount
                if (record.exchangeRate) {
                    row.getCell(6).numFmt = '#,##0.00'; // Exchange rate
                }
                if (record.amountTHB) {
                    row.getCell(7).numFmt = '#,##0.00'; // THB amount
                }
            });

            // If no receipt records, add an empty row with borders
            if (receiptRecords.length === 0) {
                const emptyRow: any = worksheet.addRow(['', '', '', '', '', '', '', '', '']);
                emptyRow.eachCell((cell: any) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }

            // Add empty row as separator
            worksheet.addRow([]);

            // Add header for payment section
            const paymentTitleRow: any = worksheet.addRow([]);
            paymentTitleRow.getCell(1).value = 'ประเภท';
            paymentTitleRow.getCell(3).value = 'จ่าย';
            paymentTitleRow.font = { bold: true };

            // Style all cells in the payment section
            const paymentHeaderRow: any = worksheet.addRow([
                'รายการที่',
                'วันที่ทำรายการ',
                'หัวข้อ',
                'ผู้รับเงิน',
                'จำนวนเงิน (RMB)',
                'วันที่โอน',
                'ผู้ทำรายการ',
                'ตรวจสอบ'
            ]);

            // Style the header row with borders and background
            paymentHeaderRow.eachCell((cell: any, colNumber: number) => {
                cell.font = { bold: true };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE0E0E0' }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            });

            // Add payment data with proper formatting
            let paymentIndex: number = 1;
            const paymentRecords: any[] = records.filter((record: any) => record.type === 'PAYMENT');

            paymentRecords.forEach((record: any) => {
                const row: any = worksheet.addRow([
                    paymentIndex++,
                    new Date(record.date).toLocaleDateString('th-TH'),
                    record.title,
                    record.payTo || '',
                    record.amountRMB,
                    record.transferDate ? new Date(record.transferDate).toLocaleDateString('th-TH') : '',
                    record.createdBy || '',
                    record.transferSlip ? 'มีสลิป' : 'ไม่มีสลิป'
                ]);

                // Add borders to all cells in the row
                row.eachCell((cell: any) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });

                // Format number cells
                row.getCell(5).numFmt = '#,##0.00'; // RMB amount
            });

            // If no payment records, add an empty row with borders
            if (paymentRecords.length === 0) {
                const emptyRow: any = worksheet.addRow(['', '', '', '', '', '', '', '']);
                emptyRow.eachCell((cell: any) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }

            // Calculate totals
            let totalReceiptRMB: number = 0;
            let totalPaymentRMB: number = 0;
            let totalReceiptTHB: number = 0;
            let totalExchangeRateSum: number = 0;
            let exchangeRateCount: number = 0;

            records.forEach((record: any) => {
                if (record.type === 'RECEIPT') {
                    totalReceiptRMB += record.amountRMB;
                    if (record.amountTHB) {
                        totalReceiptTHB += record.amountTHB;
                    }
                    if (record.exchangeRate) {
                        totalExchangeRateSum += record.exchangeRate;
                        exchangeRateCount++;
                    }
                } else {
                    totalPaymentRMB += record.amountRMB;
                }
            });

            const averageExchangeRate: number = exchangeRateCount > 0 ? totalExchangeRateSum / exchangeRateCount : 0;

            // Add summary rows with proper formatting
            const summaryRows: any[] = [
                { label: 'จำนวนเงินรับรวม', value: totalReceiptRMB, currency: 'RMB' },
                { label: 'จำนวนเงินจ่ายรวม', value: totalPaymentRMB, currency: 'RMB' },
                { label: 'คงเหลือรวม', value: totalReceiptRMB - totalPaymentRMB, currency: 'RMB' },
                { label: 'ค่าเฉลี่ยอัตราแลกเปลี่ยน', value: averageExchangeRate.toFixed(2) }
            ];

            summaryRows.forEach((item: any) => {
                const row: any = worksheet.addRow([]);
                row.getCell(1).value = item.label;
                row.getCell(5).value = item.value;
                if (item.currency) {
                    row.getCell(6).value = item.currency;
                }
                row.font = { bold: true };
                row.getCell(5).numFmt = '#,##0.00';
                row.getCell(5).alignment = { horizontal: 'right' };
            });

            // Add empty row for spacing
            worksheet.addRow([]);

            // Create directory for excel files if it doesn't exist
            const excelDir: string = path.join(process.cwd(), 'public', 'excel');
            if (!fs.existsSync(excelDir)) {
                fs.mkdirSync(excelDir, { recursive: true });
            }

            // Generate a unique filename
            const fileName: string = `financial_records_${accountOwner}_${uuidv4()}.xlsx`;
            const filePath: string = path.join(excelDir, fileName);

            // Write the file
            await workbook.xlsx.writeFile(filePath);

            // Return the file URL
            const fileUrl: string = `/excel/${fileName}`;
            return res.status(200).json({
                success: true,
                fileUrl
            });

        } catch (error: any) {
            console.error('Error exporting to Excel:', error);
            return res.status(500).json({
                success: false,
                message: 'Error generating Excel file'
            });
        }
    }

    public async exportWithdrawalInformationToExcel(req: Request, res: Response) {
        try {
            const { startDate, endDate, search } = req.query;

            // Create a new instance of the repository to fetch data
            const financeRepo = new FinanceRepository();

            // Get withdrawal information with filters
            const data = await financeRepo.getWidhdrawalInformation({
                startDate: startDate as string,
                endDate: endDate as string,
                search: search as string
            });

            const withdrawalRecords = data.widhdrawalInformation;

            // Group records by group_id
            const groupedRecords: { [key: string]: any[] } = {};
            withdrawalRecords.forEach((record: any) => {
                const groupId = record.group_id || 'no_group';
                if (!groupedRecords[groupId]) {
                    groupedRecords[groupId] = [];
                }
                groupedRecords[groupId].push(record);
            });

            // Create a new workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Withdrawal Information');

            // Define columns
            worksheet.columns = [
                { header: 'กลุ่ม', key: 'group_id', width: 10 },
                { header: 'No', key: 'index', width: 5 },
                { header: 'Invoice & PackingList No.', key: 'invoice_package', width: 30 },
                { header: 'Consignee', key: 'consignee', width: 30 },
                { header: 'วันที่เบิก', key: 'withdrawal_date', width: 15 },
                { header: 'ยอดเบิก', key: 'withdrawal_amount', width: 15 },
                { header: 'ยอดโอน', key: 'transfer_amount', width: 15 },
                { header: 'ค่าอื่นๆ', key: 'pay_price', width: 15 },
                { header: 'ค่าน้ำมัน', key: 'pay_gasoline', width: 15 },
                { header: 'คงเหลือ', key: 'pay_total', width: 15 },
                { header: 'คืนใคร', key: 'return_people', width: 20 },
                { header: 'ประเภท', key: 'record_type', width: 15 }
            ];

            // Style the header row
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            let rowIndex = 2;
            let grandTotalWithdrawalAmount = 0;
            let grandTotalTransferAmount = 0;
            let grandTotalPayPrice = 0;
            let grandTotalPayGasoline = 0;
            let grandTotalPayTotal = 0;

            // Process each group
            Object.entries(groupedRecords).forEach(([groupId, records]) => {
                if (groupId === 'no_group') return; // Skip records without group_id

                // Calculate group totals (exclude SUMMARY_RECORD from calculations)
                const regularRecords = records.filter((record: any) => record.invoice_package !== 'SUMMARY_RECORD');
                const summaryRecord = records.find((record: any) => record.invoice_package === 'SUMMARY_RECORD');

                // Calculate group totals correctly
                const groupTotalWithdrawalAmount = regularRecords.reduce((sum: number, record: any) => 
                    sum + Number(record.withdrawal_amount || 0), 0);
                
                // For transfer_amount, only count it once per group (from the first record)
                const groupTransferAmount = regularRecords.length > 0 ? Number(regularRecords[0].transfer_amount || 0) : 0;
                
                const groupTotalPayPrice = regularRecords.reduce((sum: number, record: any) => 
                    sum + Number(record.pay_price || 0), 0);
                
                const groupTotalPayGasoline = regularRecords.reduce((sum: number, record: any) => 
                    sum + Number(record.pay_gasoline || 0), 0);
                
                // Calculate pay_total correctly as the remaining amount
                // ยอดคงเหลือ = ยอดโอน - (ยอดเบิก + ค่าน้ำมัน + ค่าอื่นๆ)
                const groupTotalPayTotal = groupTransferAmount - (groupTotalWithdrawalAmount + groupTotalPayGasoline + groupTotalPayPrice);
                
                // Add group header
                const groupHeaderRow = worksheet.addRow({
                    group_id: `กลุ่ม ${groupId}`,
                    index: '',
                    invoice_package: `จำนวน ${regularRecords.length} รายการ`,
                    consignee: '',
                    withdrawal_date: regularRecords.length > 0 ? moment(regularRecords[0].withdrawal_date).format('DD/MM/YYYY') : '',
                    withdrawal_amount: '',
                    transfer_amount: groupTransferAmount, // Show transfer amount in group header
                    pay_price: '',
                    pay_gasoline: '',
                    pay_total: '',
                    return_people: '',
                    record_type: ''
                });

                // Style the group header
                groupHeaderRow.font = { bold: true };
                groupHeaderRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE6F0FF' } // Light blue background
                };

                rowIndex++;

                // Add regular records
                regularRecords.forEach((record: any, index: number) => {
                    worksheet.addRow({
                        group_id: '',
                        index: index + 1,
                        invoice_package: record.invoice_package,
                        consignee: record.consignee,
                        withdrawal_date: record.withdrawal_date ? moment(record.withdrawal_date).format('DD/MM/YYYY') : '',
                        withdrawal_amount: Number(record.withdrawal_amount || 0),
                        transfer_amount: '', // Don't show transfer amount in individual records to avoid confusion
                        pay_price: Number(record.pay_price || 0),
                        pay_gasoline: Number(record.pay_gasoline || 0),
                        pay_total: Number(record.pay_total || 0),
                        return_people: record.return_people,
                        record_type: 'รายการปกติ'
                    });
                    rowIndex++;
                });

                // Add summary record if exists
                if (summaryRecord) {
                    const summaryRow = worksheet.addRow({
                        group_id: '',
                        index: 'สรุป',
                        invoice_package: 'SUMMARY_RECORD',
                        consignee: summaryRecord.consignee,
                        withdrawal_date: '',
                        withdrawal_amount: groupTotalWithdrawalAmount,
                        transfer_amount: '', // Don't show transfer amount in summary to avoid confusion
                        pay_price: groupTotalPayPrice,
                        pay_gasoline: groupTotalPayGasoline,
                        pay_total: groupTotalPayTotal, // Use the correctly calculated pay_total
                        return_people: '',
                        record_type: 'รายการสรุป'
                    });

                    // Style the summary row
                    summaryRow.font = { bold: true };
                    summaryRow.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFD6E8FF' } // Lighter blue for summary
                    };

                    rowIndex++;
                }

                // Add empty row between groups
                worksheet.addRow({});
                rowIndex++;

                // Update grand totals
                grandTotalWithdrawalAmount += groupTotalWithdrawalAmount;
                grandTotalTransferAmount += groupTransferAmount; // Only count transfer_amount once per group
                grandTotalPayPrice += groupTotalPayPrice;
                grandTotalPayGasoline += groupTotalPayGasoline;
                grandTotalPayTotal += groupTotalPayTotal;
            });

            // Add grand total row
            const grandTotalRow = worksheet.addRow({
                group_id: '',
                index: '',
                invoice_package: 'รวมทั้งหมด',
                consignee: '',
                withdrawal_date: '',
                withdrawal_amount: grandTotalWithdrawalAmount,
                transfer_amount: grandTotalTransferAmount,
                pay_price: grandTotalPayPrice,
                pay_gasoline: grandTotalPayGasoline,
                pay_total: grandTotalTransferAmount - (grandTotalWithdrawalAmount + grandTotalPayPrice + grandTotalPayGasoline), // Calculate correctly
                return_people: '',
                record_type: ''
            });

            // Style the grand total row
            grandTotalRow.font = { bold: true };
            grandTotalRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFD700' } // Gold color for grand total
            };

            // Format number columns for all rows
            for (let i = 2; i <= rowIndex; i++) {
                ['withdrawal_amount', 'transfer_amount', 'pay_price', 'pay_gasoline', 'pay_total'].forEach(key => {
                    const cell = worksheet.getCell(`${this.getColumnLetter(key)}${i}`);
                    if (cell.value !== '') {
                        cell.numFmt = '#,##0.00';
                    }
                });
            }

            // Set the response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=withdrawal_information.xlsx');

            // Write to a buffer and send the response
            const buffer = await workbook.xlsx.writeBuffer();
            res.end(Buffer.from(buffer));

        } catch (err: any) {
            console.log('Error exporting withdrawal information to Excel', err);
            res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการส่งออกข้อมูลเป็น Excel',
                error: err.message
            });
        }
    }

    // Helper function to get column letter from key
    private getColumnLetter(key: string): string {
        const columns: any = {
            'index': 'A',
            'invoice_package': 'B',
            'consignee': 'C',
            'withdrawal_date': 'D',
            'withdrawal_amount': 'E',
            'transfer_amount': 'F',
            'pay_price': 'G',
            'pay_gasoline': 'H',
            'pay_total': 'I',
            'return_people': 'J',
            'record_type': 'K'
        };
        return columns[key] || '';
    }

    public async getCustomerAccounts(req: Request, res: Response) {
        try {
            const financeRepository = new FinanceRepository();
            const customerAccounts = await financeRepository.getCustomerAccounts();

            const response = {
                data: customerAccounts,
                message: "ดึงข้อมูลบัญชีลูกค้าสำเร็จ",
                statusCode: 200
            };

            return res.status(200).json(response);
        } catch (err: any) {
            console.log('Error fetching customer accounts:', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการดึงข้อมูลบัญชีลูกค้า",
                statusCode: 500,
                error: err.message
            });
        }
    }

    public async getCompanyAccounts(req: Request, res: Response) {
        try {
            const financeRepository = new FinanceRepository();
            const companyAccounts = await financeRepository.getCompanyAccounts();

            const response = {
                data: companyAccounts,
                message: "ดึงข้อมูลบัญชีบริษัทสำเร็จ",
                statusCode: 200
            };

            return res.status(200).json(response);
        } catch (err: any) {
            console.log('Error fetching company accounts:', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการดึงข้อมูลบัญชีบริษัท",
                statusCode: 500,
                error: err.message
            });
        }
    }

    // Export finance work data to Excel
    public async exportFinanceWorkToExcel(req: Request, res: Response) {
        try {
            const filters: any = req.query;
            const financeRepository = new FinanceRepository();

            // Get all records without pagination for export
            const result: any = await financeRepository.getPurchase({
                ...filters,
                page: 1,
                limit: 1000
            });

            if (!result || !result.purchase || result.purchase.length === 0) {
                return res.status(404).json({ message: 'ไม่พบข้อมูล' });
            }

            const records = result.purchase;

            // Create a new Excel workbook
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Tegcago Financial System';
            workbook.lastModifiedBy = 'Tegcago';
            workbook.created = new Date();
            workbook.modified = new Date();

            // Add a worksheet
            const worksheet = workbook.addWorksheet('รายงานการเงิน', {
                pageSetup: {
                    paperSize: 9, // A4
                    orientation: 'landscape',
                    fitToPage: true
                }
            });

            // Set column widths
            worksheet.columns = [
                { key: 'index', width: 5 },
                { key: 'bookNumber', width: 15 },
                { key: 'date', width: 12 },
                { key: 'shipmentType', width: 15 },
                { key: 'containerNo', width: 15 },
                { key: 'blNo', width: 15 },
                { key: 'consignee', width: 20 },
                { key: 'agency', width: 20 },
                { key: 'shippingLine', width: 15 },
                { key: 'etd', width: 12 },
                { key: 'eta', width: 12 },
                { key: 'shipmentNumber', width: 15 },
                { key: 'status', width: 15 },
                { key: 'paymentStatus', width: 20 }
            ];

            // Add title
            const titleRow = worksheet.addRow(['รายงานการเงิน']);
            titleRow.font = { bold: true, size: 16 };
            titleRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells(`A${titleRow.number}:N${titleRow.number}`);

            // Add date
            const dateRow = worksheet.addRow([`วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`]);
            dateRow.font = { bold: true };
            worksheet.mergeCells(`A${dateRow.number}:N${dateRow.number}`);

            // Add filter information if filters were applied
            if (filters.startDate || filters.endDate || filters.shipmentType) {
                const filterRow = worksheet.addRow(['ตัวกรอง:']);
                filterRow.font = { bold: true };
                
                let filterText = '';
                
                if (filters.startDate && filters.endDate) {
                    const startDate = new Date(filters.startDate);
                    const endDate = new Date(filters.endDate);
                    filterText += `วันที่: ${startDate.toLocaleDateString('th-TH')} ถึง ${endDate.toLocaleDateString('th-TH')} `;
                } else if (filters.startDate) {
                    const startDate = new Date(filters.startDate);
                    filterText += `วันที่ตั้งแต่: ${startDate.toLocaleDateString('th-TH')} `;
                } else if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    filterText += `วันที่ถึง: ${endDate.toLocaleDateString('th-TH')} `;
                }
                
                if (filters.shipmentType) {
                    filterText += `ประเภท Shipment: ${filters.shipmentType}`;
                }
                
                if (filterText) {
                    const filterInfoRow = worksheet.addRow([filterText]);
                    worksheet.mergeCells(`A${filterInfoRow.number}:N${filterInfoRow.number}`);
                }
            }

            // Add empty row for spacing
            worksheet.addRow([]);

            // Add headers
            const headerRow = worksheet.addRow([
                'ลำดับ',
                'เลขที่บุ๊คกิ้ง',
                'วันที่',
                'ประเภท Shipment',
                'Container No',
                'B/L No',
                'Consignee',
                'Agency',
                'สายเรือ',
                'ETD',
                'ETA',
                'เลข Shipment',
                'สถานะ',
                'สถานะการชำระเงิน'
            ]);

            // Style the header row
            headerRow.eachCell((cell) => {
                cell.font = { bold: true };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFD3D3D3' }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });

            // Add data rows
            records.forEach((data: any, index: number) => {
                const row = worksheet.addRow([
                    index + 1,
                    data?.book_number || '',
                    data?.createdAt ? new Date(data.createdAt).toLocaleDateString('th-TH') : '',
                    data?.d_transport || '',
                    data?.cs_purchase?.[0]?.receive?.container_no || '',
                    data?.cs_purchase?.find((res: any) => res.status_key === "Departure")?.provedeparture?.bl_no || '',
                    data?.cs_purchase?.find((res: any) => res.status_name === "จองตู้")?.bookcabinet?.consignee || '',
                    data?.d_agentcy?.some((agency: any) => agency?.d_sale_agentcy?.length > 0)
                        ? data.d_agentcy.find((agency: any) => agency?.d_sale_agentcy?.length > 0)
                            ?.d_sale_agentcy[0]?.d_agentcy?.agentcy?.agent_name || ''
                        : '',
                    data?.d_agentcy?.some((agency: any) => agency?.d_sale_agentcy?.length > 0)
                        ? data.d_agentcy.find((agency: any) => agency?.d_sale_agentcy?.length > 0)
                            ?.d_sale_agentcy[0]?.d_agentcy?.agent_boat || ''
                        : '',
                    data?.d_agentcy?.some((agency: any) => agency?.d_sale_agentcy?.length > 0)
                        ? data.d_agentcy.find((agency: any) => agency?.d_sale_agentcy?.length > 0)
                            ?.d_sale_agentcy[0]?.d_agentcy?.agentcy_etd || ''
                        : '',
                    data?.d_agentcy?.some((agency: any) => agency?.d_sale_agentcy?.length > 0)
                        ? data.d_agentcy.find((agency: any) => agency?.d_sale_agentcy?.length > 0)
                            ?.d_sale_agentcy[0]?.d_agentcy?.agentcy_eta || ''
                        : '',
                    data?.d_shipment_number || '',
                    data?.d_status || '',
                    data?.purchase_finance?.length > 0 ? data?.purchase_finance[0]?.payment_status : ''
                ]);

                // Style data rows
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Generate a unique filename
            const fileName = `รายงานการเงิน_${new Date().toISOString().slice(0, 10)}.xlsx`;
            const filePath = path.join('public', 'exports', fileName);

            // Ensure the directory exists
            if (!fs.existsSync(path.join('public', 'exports'))) {
                fs.mkdirSync(path.join('public', 'exports'), { recursive: true });
            }

            // Write the file
            await workbook.xlsx.writeFile(filePath);

            // Send the file as a download
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    // Clean up the file after download attempt
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } else {
                    // Clean up the file after successful download
                    setTimeout(() => {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }, 60000); // Delete after 1 minute
                }
            });
        } catch (err: any) {
            console.error('Error exporting finance work to Excel:', err);
            res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการส่งออกข้อมูล',
                error: err.message,
                statusCode: 500
            });
        }
    }
}
