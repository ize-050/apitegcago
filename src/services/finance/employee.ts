import { PrismaClient } from '@prisma/client';

export class EmployeeService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all employees with the salesupport role
   * @returns Array of employees with salesupport role
   */
  public async getSalesSupportEmployees() {
    try {
      const employees = await this.prisma.user.findMany({
        where: {
          roles: {
            roles_name: 'Salesupport'
          }
        },
        select: {
          id: true,
          fullname: true,
          email: true,
          roles: true
        }
      });

      return employees;
    } catch (error) {
      console.error('Error fetching sales support employees:', error);
      throw error;
    }
  }
}
