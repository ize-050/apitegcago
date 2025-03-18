import { Request, Response } from "express";
import EmployeeService from "../../services/employee/index.service";

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  /**
   * Get employees by role name
   * @param req Express request object
   * @param res Express response object
   * @returns JSON response with employees data
   */
  async getEmployeesByRole(req: Request, res: Response): Promise<any> {
    try {
      const { roleName } = req.params;
      
      if (!roleName) {
        return res.status(400).json({ 
          success: false, 
          error: "Role name is required" 
        });
      }

      const employees = await this.employeeService.getEmployeesByRole(roleName);
      
      return res.status(200).json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error(`Error in employee controller getEmployeesByRole:`, error);
      return res.status(500).json({ 
        success: false, 
        error: "An error occurred while fetching employees" 
      });
    }
  }


  async getSalesSupportEmployees(req: Request, res: Response): Promise<any> {
    try {
      const employees = await this.employeeService.getEmployeesByRole("Salesupport");
      
      return res.status(200).json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error(`Error in employee controller getSalesSupportEmployees:`, error);
      return res.status(500).json({ 
        success: false, 
        error: "An error occurred while fetching salesupport employees" 
      });
    }
  }

  /**
   * Get all employees
   * @param req Express request object
   * @param res Express response object
   * @returns JSON response with all employees data
   */
  async getAllEmployees(req: Request, res: Response): Promise<any> {
    try {
      const employees = await this.employeeService.getAllEmployees();
      
      return res.status(200).json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error(`Error in employee controller getAllEmployees:`, error);
      return res.status(500).json({ 
        success: false, 
        error: "An error occurred while fetching all employees" 
      });
    }
  }
}
