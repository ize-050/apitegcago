import express from "express";
import workRoutes from "./work";
import commissionRanksRoutes from "./commission-ranks.routes";
import transferRoutes from "./transfer.routes";
import transferTypesRoutes from "./transfer-types.routes";
import transferCommissionRoutes from "./transfer-commission.routes";

const router = express.Router();

// Register HR routes
router.use("/work", workRoutes);
router.use("/commission-ranks", commissionRanksRoutes);
router.use("/transfer", transferRoutes);
router.use("/transfer-types", transferTypesRoutes);
router.use("/transfer/commission", transferCommissionRoutes);

module.exports = router;
