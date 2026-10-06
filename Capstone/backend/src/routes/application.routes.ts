import { Router } from "express";

import {
  applyForJob,
  cancelApplication,
  getMyApplications,
  getApplicationsByJob,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus,
  getCandidateResume,
} from "../controller/application.controller";

import { getApplicationAssessmentReview } from "../controller/assessmentReview.controller";

import { protect } from "../lib/middleware/auth.middleware";
import { authorize } from "../lib/middleware/role.middleware";
import { validate } from "../lib/middleware/validate.middleware";
import { UserRole } from "../lib/entity/User";
import { updateApplicationStatusSchema } from "../lib/validation/application.validation";
import { uploadResume } from "../lib/middleware/resumeUpload.middleware";

const router = Router();

// Candidate routes
router.post(
  "/job/:jobId/apply",
  protect,
  authorize(UserRole.CANDIDATE),
  uploadResume.single("resume"),
  applyForJob,
);

router.get("/my", protect, authorize(UserRole.CANDIDATE), getMyApplications);
router.delete("/:id", protect, authorize(UserRole.CANDIDATE), cancelApplication);
router.get("/:id", protect, authorize(UserRole.HR), getApplicationById);


// HR routes
router.get("/", protect, authorize(UserRole.HR), getAllApplications);

router.get(
  "/job/:jobId",
  protect,
  authorize(UserRole.HR),
  getApplicationsByJob,
);

router.get(
  "/:applicationId/resume",
  protect,
  authorize(UserRole.HR, UserRole.INTERVIEWER),
  getCandidateResume,
);

router.get(
  "/:applicationId/assessments",
  protect,
  authorize(UserRole.HR),
  getApplicationAssessmentReview,
);

router.patch(
  "/:id/status",
  protect,
  authorize(UserRole.HR),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus,
);

export default router;
