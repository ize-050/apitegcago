import { Request, Response } from "express";
import { prisma } from "../../prisma/prisma-client";
import bcrypt from "bcrypt";

class UserRepository {

  constructor() {
    // ใช้ prisma singleton แทนการสร้าง PrismaClient ใหม่
  }

  async login(request: { email: string; password: string }): Promise<any> {
    try {
      const { email, password } = request;

      const user = await prisma.user.findUnique({
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
