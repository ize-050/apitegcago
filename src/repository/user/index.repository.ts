import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async login(request: { email: string; password: string }): Promise<any> {
    try {
      const { email, password } = request;

      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          roles: true,
        },
      });
      if (!user) {
        return false;
      }
      const checkPassword = await bcrypt.compare(password, user.password)

      if (!checkPassword) {
        console.log("password",user.password)
         return false;
      }
      return user;
    } catch (err: any) {
      throw err;
    }
  }
}

export default UserRepository;
