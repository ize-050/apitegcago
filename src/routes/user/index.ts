import { Router } from 'express';
import { UserController } from '../../controllers/user/index.controller';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // For password hashing


import express from 'express'
import { Request, Response } from 'express';
const router = Router()


const userController = new UserController();

router.post('/login', (req, res) =>  userController.login(req, res));


router.get('/addseed',async(req,res)=>{
 
const prisma = new PrismaClient();

    // Create Roles
    try{

        const customerDetails = [
            {
                cus_fullname: "John Doe",
                cus_phone: "123-456-7890",
                cus_line: "johndoe123",
                cus_website: "https://www.johndoe.com",
                cus_etc: "Some additional info",
                cus_facebook: "https://www.facebook.com/johndoe",
                cus_wechat: "johndoe_wechat",
                cd_consider: "Hot",
                cd_typeinout: "Inbound",
                cd_custype: "Individual",
                cd_cusservice: "Product A",
                cd_channels: "Website",
                cd_num: 5,
                cd_capital: "100000",
                cd_emp: "10",
                cd_shareholders: "John Doe",
                cd_address: "123 Main Street",
                cd_num_saka: "12345",
                cd_frequency: "Monthly",
                cd_leader: "John Doe",
                cd_priority: "High",
                cus_status: "Active",
                user_id: "a26adcb1-52b6-4c26-a44a-780d1c4c22dd"
            },
            // ... add more customer objects here
        ];
    
        for (const customer of customerDetails) {
            // Destructure customer details
            const { 
                cus_fullname,
                cus_phone,
                cus_line,
                cus_website,
                cus_etc,
                cus_facebook,
                cus_wechat,
                cd_consider,
                cd_typeinout,
                cd_custype,
                cd_cusservice,
                cd_channels,
                cd_num,
                cd_capital,
                cd_emp,
                cd_shareholders,
                cd_address,
                cd_num_saka,
                cd_frequency,
                cd_leader,
                cd_priority,
                cus_status,
                user_id
            } = customer;
    
      
                const newCustomer = await prisma.customer.create({
                    data: {
                        cus_fullname,
                        cus_phone,
                        cus_line,
                        cus_website,
                        cus_etc,
                        cus_facebook,
                        cus_wechat,
                        details: {
                            create: {
                                cd_consider,
                                cd_typeinout,
                                cd_custype,
                                cd_cusservice,
                                cd_channels,
                                cd_num,
                                cd_capital,
                                cd_emp,
                                cd_shareholders,
                                cd_address,
                                cd_num_saka,
                                cd_frequency,
                                cd_leader,
                                cd_priority,
                            },
                        },
                        customer_status: {
                            create: {
                                cus_status,
                                active: "true",
                            },
                        },
                        customer_emp: {
                            create: {
                                user_id,
                                cus_status: "Assigned",
                                active: "true",
                            },
                        },
                    },
                });
            
     res.status(200)
     
}
    }
catch(err){
    console.log('errerer',err)
    res.status(500).json(err)
}


})

module.exports = router