import { Router } from "express";

import {
  getInterviewerInterviews,
  getInterviewerInterviewById,
} from "../controller/interviewer.controller";

import { protect } from "../lib/middleware/auth.middleware";
import { authorize } from "../lib/middleware/role.middleware";
import { UserRole } from "../lib/entity/User";

const router = Router();

router.use(protect, authorize(UserRole.INTERVIEWER));

// Get all interviews assigned to logged-in interviewer
router.get("/interviews", getInterviewerInterviews);

// Get one assigned interview
router.get("/interviews/:id", getInterviewerInterviewById);

export default router;
