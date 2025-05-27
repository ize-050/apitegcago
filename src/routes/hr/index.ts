import express from "express";
import workRoutes from "./work";
import commissionRanksRoutes from "./commission-ranks.routes";
import commissionRolesRoutes from "./commission-roles.routes";
import transferRoutes from "./transfer.routes";
import transferTypesRoutes from "./transfer-types.routes";
import transferCommissionRoutes from "./transfer-commission.routes";
import dashboardRoutes from "./dashboard.routes";

const router = express.Router();

// Register HR routes
router.use("/work", workRoutes);
router.use("/commission-ranks", commissionRanksRoutes);
router.use("/commission-roles", commissionRolesRoutes);
router.use("/transfer", transferRoutes);
router.use("/transfer-types", transferTypesRoutes);
router.use("/transfer/commission", transferCommissionRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
