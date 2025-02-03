import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

class SuperadminRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getEmployee(request: any): Promise<any> {
    try {
      const whereCondition: any = {};

      if (request.role_name) {
        whereCondition.roles = {
          roles_name: request.role_name,
        };
      }
      const data = await this.prisma.user.findMany({
        where: whereCondition,
        skip: request.skip,
        take: request.take,
        include: {
          roles: true,
        },
      });

      const total = await this.prisma.user.count({
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
