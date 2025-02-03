import { Request, Response } from "express";
import SuperadminRepo from "../../repository/superadmin/index.repository";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

class SuperadminService {
  private superadminRepo: SuperadminRepo;
  constructor() {
    this.superadminRepo = new SuperadminRepo();
  }

  async getEmployee(request: any): Promise<any> {
    try {   
      const data = await this.superadminRepo.getEmployee(request);
      return data;
    } catch (err: any) {
      throw err;
    }
  }
}

export default SuperadminService;
