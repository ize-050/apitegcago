import { Router } from "express";
import ConsignmentController from "../../controllers/finance/consignment.controller";

class ConsignmentRoute {
  public router: Router;
  private consignmentController: ConsignmentController;

  constructor() {
    this.router = Router();
    this.consignmentController = new ConsignmentController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create a new consignment record
    this.router.post(
      "/consignments",
      this.consignmentController.createConsignment.bind(this.consignmentController)
    );

    // Get all consignment records with optional filters
    this.router.get(
      "/consignments",
      this.consignmentController.getConsignments.bind(this.consignmentController)
    );

    // Get a specific consignment record by ID
    this.router.get(
      "/consignments/:id",
      this.consignmentController.getConsignmentById.bind(this.consignmentController)
    );

    // Update a consignment record
    this.router.put(
      "/consignments/:id",
      this.consignmentController.updateConsignment.bind(this.consignmentController)
    );

    // Delete a consignment record
    this.router.delete(
      "/consignments/:id",
      this.consignmentController.deleteConsignment.bind(this.consignmentController)
    );
  }
}

export default ConsignmentRoute;
