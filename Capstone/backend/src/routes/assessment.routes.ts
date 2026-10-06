import { Router } from "express";
import {
  startAssessment,
  getAssessment,
  getMyAttemptsByJob,
  saveAnswer,
  submitAssessment,
  getAssessmentResult,
  reportAssessmentViolation,
  updateCameraStatus,
} from "../controller/assessment.controller";
import { protect } from "../lib/middleware/auth.middleware";
import { authorize } from "../lib/middleware/role.middleware";
import { validate } from "../lib/middleware/validate.middleware";
import { UserRole } from "../lib/entity/User";
import {
  assessmentViolationSchema,
  cameraStatusSchema,
  saveAnswerSchema,
} from "../lib/validation/assessment.validation";

const router = Router();

router.use(protect, authorize(UserRole.CANDIDATE));

router.post("/round/:roundId/start", startAssessment);

router.get("/job/:jobId/my", getMyAttemptsByJob);

router.get("/:attemptId", getAssessment);
router.post("/:attemptId/answers", validate(saveAnswerSchema), saveAnswer);
router.post("/:attemptId/submit", submitAssessment);
router.get("/:attemptId/result", getAssessmentResult);

router.post(
  "/:attemptId/violation",
  validate(assessmentViolationSchema),
  reportAssessmentViolation,
);

router.patch(
  "/:attemptId/camera",
  validate(cameraStatusSchema),
  updateCameraStatus,
);

export default router;
