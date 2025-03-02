import { Router } from 'express';
import { EmployeeController } from '../../controllers/employee/index.controller';

const router = Router();
const employeeController = new EmployeeController();

// Get all employees
router.get('/', (req, res) => employeeController.getAllEmployees(req, res));

// Get employees by role
router.get('/role/:roleName', (req, res) => employeeController.getEmployeesByRole(req, res));

// Get all salesupport employees
router.get('/salesupport', (req, res) => employeeController.getSalesSupportEmployees(req, res));

module.exports = router;
