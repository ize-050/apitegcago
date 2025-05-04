import { Request, Response } from "express";
import { prisma } from "../../prisma/prisma-client";
import bcrypt from "bcrypt";

class SuperadminRepository {

  constructor() {
    // ใช้ prisma singleton แทนการสร้าง PrismaClient ใหม่
  }

  async getEmployee(request: any): Promise<any> {
    try {
      const whereCondition: any = {};

      if (request.role_name) {
        whereCondition.roles = {
          roles_name: request.role_name,
        };
      }
      const data = await prisma.user.findMany({
        where: whereCondition,
        skip: request.skip,
        take: request.take,
        include: {
          roles: true,
        },
      });

      const total = await prisma.user.count({
        where: whereCondition,
      });

      return {
        data: data,
        total: total,
      };
    } catch (error) {
      console.log(error);
    }
  }
}

export default SuperadminRepository;
