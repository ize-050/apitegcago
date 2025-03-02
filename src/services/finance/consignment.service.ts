import ConsignmentRepository from "../../repository/finance/consignment.repository";
import { ConsignmentCreateDto, ConsignmentUpdateDto } from "./dto/consignment.interface";

class ConsignmentService {
  private consignmentRepo: ConsignmentRepository;

  constructor() {
    this.consignmentRepo = new ConsignmentRepository();
  }

  public async createConsignment(data: ConsignmentCreateDto): Promise<any> {
    try {
      const record = await this.consignmentRepo.createConsignment(data);
      return record;
    } catch (err: any) {
      console.log("Error creating consignment record", err);
      throw err;
    }
  }

  public async getConsignments(filters: any): Promise<any> {
    try {
      const records = await this.consignmentRepo.getConsignments(filters);
      return records;
    } catch (err: any) {
      console.log("Error getting consignment records", err);
      throw err;
    }
  }

  public async getConsignmentById(id: string): Promise<any> {
    try {
      const record = await this.consignmentRepo.getConsignmentById(id);
      return record;
    } catch (err: any) {
      console.log("Error getting consignment record by ID", err);
      throw err;
    }
  }

  public async updateConsignment(id: string, data: ConsignmentUpdateDto): Promise<any> {
    try {
      const record = await this.consignmentRepo.updateConsignment(id, data);
      return record;
    } catch (err: any) {
      console.log("Error updating consignment record", err);
      throw err;
    }
  }

  public async deleteConsignment(id: string): Promise<any> {
    try {
      const record = await this.consignmentRepo.deleteConsignment(id);
      return record;
    } catch (err: any) {
      console.log("Error deleting consignment record", err);
      throw err;
    }
  }
}

export default ConsignmentService;
