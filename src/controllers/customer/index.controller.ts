import { Request, Response } from "express";
import CustomerService from "../../services/customer/index.service";
import z from "zod";

//validate
import {
  ValidationCreateCustomer,
  ValidationEditCustomer,
  ValidationsubmitEstimate,
} from "../../validation/validationSchema";
import upload from "../../config/multerConfig";
import multer from "multer";
import moment from "moment";

export class CustomerController {
  private customerservice;

  constructor() {
    this.customerservice = new CustomerService();
  }

  async getSelectCustomer(req: Request, res: Response): Promise<any> {
    try {
      const customerAll = await this.customerservice.getSelectCustomer();

      res.status(200).json({message: "get success", data: customerAll});
    } catch (err: any) {
      console.log('errrr', err)
      res.status(500).json(err)
    }
  }

  async getCustomerGroup(req: Request, res: Response): Promise<any> {
    try {
      const customerGroup = await this.customerservice.getCustomerGroup();

      res.status(200).json({message: "get success", data: customerGroup});
    } catch (err: any) {
      console.log('errrr', err)
      res.status(500).json(err)
    }
  }

}
