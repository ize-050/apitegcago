import { Router } from "express";
import { EmployeeController } from "../../controllers/employee/index.controller";

const router = Router();
const employeeController = new EmployeeController();

// Get employees by role
router.get("/role/:role", employeeController.getEmployeesByRole.bind(employeeController));

export default router;
