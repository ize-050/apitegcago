import EmployeeRepository from "../../repository/employee/index.repository";

class EmployeeService {
  private employeeRepo: EmployeeRepository;

  constructor() {
    this.employeeRepo = new EmployeeRepository();
  }

  /**
   * Get employees by role name
   * @param roleName The name of the role to filter employees by
   * @returns Array of employees with the specified role
   */
  async getEmployeesByRole(roleName: string): Promise<any[]> {
    try {
      return await this.employeeRepo.getEmployeesByRole(roleName);
    } catch (error) {
      console.error(`Error in employee service getEmployeesByRole:`, error);
      throw error;
    }
  }

  /**
   * Get all employees
   * @returns Array of all employees
   */
  async getAllEmployees(): Promise<any[]> {
    try {
      return await this.employeeRepo.getAllEmployees();
    } catch (error) {
      console.error(`Error in employee service getAllEmployees:`, error);
      throw error;
    }
  }
}

export default EmployeeService;
