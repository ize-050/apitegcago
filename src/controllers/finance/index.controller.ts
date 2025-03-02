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

            const {search} :any = req.query;

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
            console.log("id",req.params.id)
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

    public async getWorkByid(req: Request, res: Response) {
        try {
            console.log("id",req.params.id)
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

    public async updatePurchase(req: Request, res: Response) {
        try {

            const id = req.params.id

            const purchase = await this.financeService.updatePurchase(id,req.body)
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
                if(Check.length > 0){
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
            const widhdrawalInformation = await this.financeService.updateWidhdrawalInformation(req.body)
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

    public async deleteWithdrawalInformation(req: Request, res: Response) {
        try {
            const widhdrawalInformation = await this.financeService.deleteWithdrawalInformation(req.params.id)
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
                'ตรวจสอบ',
                ''
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
                    record.transferSlip ? 'มีสลิป' : 'ไม่มีสลิป',
                    ''
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
            
            // Create a new workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Withdrawal Information');
            
            // Define columns
            worksheet.columns = [
                { header: 'No', key: 'index', width: 5 },
                { header: 'Invoice & PackingList No.', key: 'invoice_package', width: 30 },
                { header: 'Consignee', key: 'consignee', width: 30 },
                { header: 'วันที่เบิก', key: 'withdrawal_date', width: 15 },
                { header: 'ยอดเบิก', key: 'withdrawal_amount', width: 15 },
                { header: 'ยอดโอน', key: 'transfer_amount', width: 15 },
                { header: 'ยอดจ่าย', key: 'pay_price', width: 15 },
                { header: 'ค่าน้ำมัน', key: 'pay_gasoline', width: 15 },
                { header: 'คงเหลือ', key: 'pay_total', width: 15 },
                { header: 'คืนใคร', key: 'return_people', width: 20 }
            ];
            
            // Style the header row
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
            
            // Add data rows
            withdrawalRecords.forEach((record:any, index:number) => {
                worksheet.addRow({
                    index: index + 1,
                    invoice_package: record.invoice_package,
                    consignee: record.consignee,
                    withdrawal_date: record.withdrawal_date ? moment(record.withdrawal_date).format('DD/MM/YYYY') : '',
                    withdrawal_amount: Number(record.withdrawal_amount || 0),
                    transfer_amount: Number(record.transfer_amount || 0),
                    pay_price: Number(record.pay_price || 0),
                    pay_gasoline: Number(record.pay_gasoline || 0),
                    pay_total: Number(record.pay_total || 0),
                    return_people: record.return_people
                });
            });
            
            // Add totals row
            const totalRow = worksheet.addRow({
                index: '',
                invoice_package: 'รวม',
                consignee: '',
                withdrawal_date: '',
                withdrawal_amount: withdrawalRecords.reduce((sum:number, record:any) => sum + Number(record.withdrawal_amount || 0), 0),
                transfer_amount: withdrawalRecords.reduce((sum:number, record:any) => sum + Number(record.transfer_amount || 0), 0),
                pay_price: withdrawalRecords.reduce((sum:number, record:any) => sum + Number(record.pay_price || 0), 0),
                pay_gasoline: withdrawalRecords.reduce((sum:number, record:any) => sum + Number(record.pay_gasoline || 0), 0),
                pay_total: withdrawalRecords.reduce((sum:number, record:any) => sum + Number(record.pay_total || 0), 0),
                return_people: ''
            });
            
            // Style the total row
            totalRow.font = { bold: true };
            
            // Format number columns for all rows including the total row
            for (let i = 2; i <= withdrawalRecords.length + 2; i++) { 
                ['withdrawal_amount', 'transfer_amount', 'pay_price', 'pay_gasoline', 'pay_total'].forEach(key => {
                    const cell = worksheet.getCell(`${this.getColumnLetter(key)}${i}`);
                    cell.numFmt = '#,##0.00';
                });
            }
            
            // Set the response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=withdrawal_information.xlsx');
            
            // Write to a buffer and send the response
            const buffer = await workbook.xlsx.writeBuffer();
            res.end(Buffer.from(buffer));
            
        } catch (err: any) {
            console.log('Error exporting to Excel', err);
            res.status(500).json({
                message: "เกิดข้อผิดพลาดในการส่งออกข้อมูล",
                error: err.message,
                statusCode: 500
            });
        }
    }
    
    // Helper function to get column letter from key
    private getColumnLetter(key: string): string {
        const columns :any = {
            'index': 'A',
            'invoice_package': 'B',
            'consignee': 'C',
            'withdrawal_date': 'D',
            'withdrawal_amount': 'E',
            'transfer_amount': 'F',
            'pay_price': 'G',
            'pay_gasoline': 'H',
            'pay_total': 'I',
            'return_people': 'J'
        };
        return columns[key] || '';
    }
}
