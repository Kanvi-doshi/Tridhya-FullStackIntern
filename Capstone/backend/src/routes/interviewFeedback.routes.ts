import { Router } from "express";

import {
  createInterviewFeedback,
  getMyInterviewFeedback,
  getFeedbackByApplication,
} from "../controller/interviewFeedback.controller";

import { protect } from "../lib/middleware/auth.middleware";

import { authorize } from "../lib/middleware/role.middleware";

import { validate } from "../lib/middleware/validate.middleware";

import { UserRole } from "../lib/entity/User";

import { createInterviewFeedbackSchema } from "../lib/validation/interviewFeedback.validation";

const router = Router();

router.post(
  "/assignment/:assignmentId",
  protect,
  authorize(UserRole.INTERVIEWER),
  validate(createInterviewFeedbackSchema),
  createInterviewFeedback,
);

router.get(
  "/my",
  protect,
  authorize(UserRole.INTERVIEWER),
  getMyInterviewFeedback,
);

router.get(
  "/application/:applicationId",
  protect,
  authorize(UserRole.HR),
  getFeedbackByApplication,
);

export default router;