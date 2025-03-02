import { PrismaClient } from "@prisma/client";

class EmployeeRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get employees by role name
   * @param roleName The name of the role to filter employees by
   * @returns Array of employees with the specified role
   */
  async getEmployeesByRole(roleName: string): Promise<any[]> {
    try {
      const employees = await this.prisma.user.findMany({
        where: {
          roles: {
            roles_name: roleName
          },
          deletedAt: null
        },
        select: {
          id: true,
          fullname: true,
          email: true,
          roles: {
            select: {
              id: true,
              roles_name: true
            }
          }
        },
        orderBy: {
          fullname: 'asc'
        }
      });

      return employees.map(employee => ({
        id: employee.id,
        name: employee.fullname,
        email: employee.email,
        role: employee.roles.roles_name
      }));
    } catch (error) {
      console.error('Error fetching employees by role:', error);
      throw error;
    }
  }

  /**
   * Get all employees
   * @returns Array of all employees
   */
  async getAllEmployees(): Promise<any[]> {
    try {
      const employees = await this.prisma.user.findMany({
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          fullname: true,
          email: true,
          roles: {
            select: {
              id: true,
              roles_name: true
            }
          }
        },
        orderBy: {
          fullname: 'asc'
        }
      });

      return employees.map(employee => ({
        id: employee.id,
        name: employee.fullname,
        email: employee.email,
        role: employee.roles.roles_name
      }));
    } catch (error) {
      console.error('Error fetching all employees:', error);
      throw error;
    }
  }
}

export default EmployeeRepository;
