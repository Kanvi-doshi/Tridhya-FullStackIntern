import { Router } from "express";

import {
  applyForJob,
  getMyApplications,
  getApplicationsByJob,
  updateApplicationStatus,
  getCandidateResume,
} from "../controller/application.controller";

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

// HR routes
router.get(
  "/job/:jobId",
  protect,
  authorize(UserRole.HR),
  getApplicationsByJob,
);

router.get(
  "/:applicationId/resume",
  protect,
  authorize(UserRole.HR),
  getCandidateResume,
);

router.patch(
  "/:id/status",
  protect,
  authorize(UserRole.HR),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus,
);

export default router;
