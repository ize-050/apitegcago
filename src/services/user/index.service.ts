import { Request, Response } from "express";
import UserRepo from "../../repository/user/index.repository";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

class UserService {
  private userRepo: UserRepo;
  constructor() {
    this.userRepo = new UserRepo();
  }
  async login(request: { email: string; password: string }): Promise<any> {
    try {
      const user = await this.userRepo.login(request);

      if (user === false){
        return false
      }
        

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "1days",
      });
      const response = {
        user: {
            id : user.id,
            email :user.email,
            fullname :user.fullname,
            roles :user.roles,
        },
        token: token,
      };
      return response;
    } catch (err) {
      throw err;
    }
  }
}

export default UserService;
