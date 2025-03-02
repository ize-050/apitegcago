import FinanceRepository from "../../repository/finance/index.repository";

class RecordMoneyService {
  private financeRepository: FinanceRepository;

  constructor() {
    this.financeRepository = new FinanceRepository();
  }

  /**
   * Create a new financial record
   * @param data Record data
   * @returns Created record
   */
  public async createFinancialRecord(data: any): Promise<any> {
    try {
      return await this.financeRepository.createFinancialRecord(data);
    } catch (error) {
      console.error("Error in createFinancialRecord service:", error);
      throw error;
    }
  }

  /**
   * Get all financial records with optional filters
   * @param filters Optional filters for type, date range, search term
   * @returns List of financial records
   */
  public async getFinancialRecords(filters?: any): Promise<any> {
    try {
      return await this.financeRepository.getFinancialRecords(filters);
    } catch (error) {
      console.error("Error in getFinancialRecords service:", error);
      throw error;
    }
  }

  /**
   * Get a financial record by ID
   * @param id Record ID
   * @returns Financial record
   */
  public async getFinancialRecordById(id: string): Promise<any> {
    try {
      return await this.financeRepository.getFinancialRecordById(id);
    } catch (error) {
      console.error(`Error in getFinancialRecordById service for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a financial record
   * @param id Record ID
   * @param data Updated record data
   * @returns Updated record
   */
  public async updateFinancialRecord(id: string, data: any): Promise<any> {
    try {
      return await this.financeRepository.updateFinancialRecord(id, data);
    } catch (error) {
      console.error(`Error in updateFinancialRecord service for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a financial record (soft delete)
   * @param id Record ID
   * @returns Deleted record
   */
  public async deleteFinancialRecord(id: string): Promise<any> {
    try {
      return await this.financeRepository.deleteFinancialRecord(id);
    } catch (error) {
      console.error(`Error in deleteFinancialRecord service for ID ${id}:`, error);
      throw error;
    }
  }
}

export default RecordMoneyService;
