import { Router } from "express";
import {
  getCandidates,
  getInterviewers,
  updateUserRole,
  updateUserStatus,
} from "../controller/hr.controller";
import {
  getDashboardAnalytics,
  getJobAnalytics,
} from "../controller/analytics.controller";
import { protect } from "../lib/middleware/auth.middleware";
import { authorize } from "../lib/middleware/role.middleware";
import { UserRole } from "../lib/entity/User";

const router = Router();

router.use(protect, authorize(UserRole.HR));
router.get("/candidates", getCandidates);
router.get("/interviewers", getInterviewers);
router.patch("/users/:userId/role", updateUserRole);
router.patch("/users/:userId/status", updateUserStatus);
router.get("/analytics/dashboard", getDashboardAnalytics);
router.get("/analytics/job/:jobId", getJobAnalytics);

export default router;
