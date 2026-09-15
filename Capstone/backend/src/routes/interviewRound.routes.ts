import { Router } from "express";

import {
  createInterviewRound,
  getRoundsByJob,
  getInterviewRoundById,
  updateInterviewRound,
  deleteInterviewRound,
} from "../controller/interviewRound.controller";

import { protect } from "../lib/middleware/auth.middleware";
import { authorize } from "../lib/middleware/role.middleware";
import { validate } from "../lib/middleware/validate.middleware";
import { UserRole } from "../lib/entity/User";
import {
  createInterviewRoundSchema,
  updateInterviewRoundSchema,
} from "../lib/validation/interviewRound.validation";

const router = Router();

// Get all rounds of one job
router.get("/job/:jobId", protect, getRoundsByJob);
// Get single round
router.get("/:id", protect, getInterviewRoundById);
// HR - Create round
router.post(
  "/job/:jobId",
  protect,
  authorize(UserRole.HR),
  validate(createInterviewRoundSchema),
  createInterviewRound,
);

// HR - Update round
router.put(
  "/:id",
  protect,
  authorize(UserRole.HR),
  validate(updateInterviewRoundSchema),
  updateInterviewRound,
);

// HR - Delete round
router.delete("/:id", protect, authorize(UserRole.HR), deleteInterviewRound);
export default router;
