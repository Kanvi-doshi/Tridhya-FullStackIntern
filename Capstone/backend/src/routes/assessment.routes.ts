import { Router } from "express";

import {
  startAssessment,
  getAssessment,
  saveAnswer,
  submitAssessment,
  getAssessmentResult,
} from "../controller/assessment.controller";

import { protect } from "../lib/middleware/auth.middleware";

import { authorize } from "../lib/middleware/role.middleware";

import { validate } from "../lib/middleware/validate.middleware";

import { UserRole } from "../lib/entity/User";

import { saveAnswerSchema } from "../lib/validation/assessment.validation";

const router = Router();

router.post(
  "/round/:roundId/start",
  protect,
  authorize(UserRole.CANDIDATE),
  startAssessment,
);

router.get(
  "/:attemptId",
  protect,
  authorize(UserRole.CANDIDATE),
  getAssessment,
);
router.post(
  "/:attemptId/answers",
  protect,
  authorize(UserRole.CANDIDATE),
  validate(saveAnswerSchema),
  saveAnswer,
);
router.post(
  "/:attemptId/submit",
  protect,
  authorize(UserRole.CANDIDATE),
  submitAssessment,
);
router.get(
  "/:attemptId/result",
  protect,
  authorize(UserRole.CANDIDATE),
  getAssessmentResult,
);

export default router;
