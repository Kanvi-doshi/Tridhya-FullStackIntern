import { Router } from "express";

import {
  createInterviewAssignment,
  getMyAssignedInterviews,
  getMyInterviewSchedule,
  getAllInterviewAssignments,
  updateInterviewAssignment,
} from "../controller/interviewAssignment.controller";

import { protect } from "../lib/middleware/auth.middleware";

import { authorize } from "../lib/middleware/role.middleware";

import { validate } from "../lib/middleware/validate.middleware";

import { UserRole } from "../lib/entity/User";

import {
  createInterviewAssignmentSchema,
  updateInterviewAssignmentSchema,
} from "../lib/validation/interviewAssignment.validation";

const router = Router();

router.get("/", protect, authorize(UserRole.HR), getAllInterviewAssignments);

router.post(
  "/application/:applicationId/round/:roundId",
  protect,
  authorize(UserRole.HR),
  validate(createInterviewAssignmentSchema),
  createInterviewAssignment,
);

router.get(
  "/my",
  protect,
  authorize(UserRole.INTERVIEWER),
  getMyAssignedInterviews,
);

router.get(
  "/candidate/my",
  protect,
  authorize(UserRole.CANDIDATE),
  getMyInterviewSchedule,
);
router.patch(
  "/:id",
  protect,
  authorize(UserRole.HR),
  validate(updateInterviewAssignmentSchema),
  updateInterviewAssignment,
);


export default router;
