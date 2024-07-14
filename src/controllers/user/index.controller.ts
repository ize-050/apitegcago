import { Request, Response } from "express";
import UserService from "../../services/user/index.service";
export class UserController {

     private userservice
    constructor( ){
      this.userservice = new UserService();
    }

  async login(req: Request, res: Response): Promise<any> {
    try{
        const { email, password } = req.body;
        console.log('reqbodty',req.body);
            // Input validation
            if (!email || !password) {
                return res.status(400).json({ error: "กรุณากรอกอีเมลหรือพาสเวิส" });
            }
    
        const request ={
            email:email,
            password:password
        }
        const data = await this.userservice.login(request)

        if( data ===false){
            return res.status(400).json({ error: "รหัสผ่านหรืออีเมลไม่ถูกต้อง" });
        }
        res.json({
            data: data,
        });
    }
    catch(err:any){
        console.log('errrr',err)
        res.status(500).json(err)
    }
    
  }
}


