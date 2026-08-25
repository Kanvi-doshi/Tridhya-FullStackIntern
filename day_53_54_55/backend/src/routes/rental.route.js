import express from "express";
import {
  create,
  getMyRentals,
  getRentals,
  getHistory,
  changeRentalStatus,
  cancel,
} from "../controller/rental.controller.js";
import { protect } from "../components/middleware/auth.middleware.js";
import { authorize } from "../components/middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorize("Customer"), create);

// My rentals
router.get("/my", protect, authorize("Customer"), getMyRentals);
router.get("/history", protect, authorize("Customer"), getHistory);
router.put("/:id/cancel", protect, authorize("Customer"), cancel);
// Get all rentals
router.get("/", protect, authorize("Admin", "Staff"), getRentals);

router.put(
  "/:id/status",
  protect,
  authorize("Admin", "Staff"),
  changeRentalStatus,
);

export default router;
