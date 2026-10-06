import { Router } from "express";

import {
  calculateCandidateScore,
  getCandidateEvaluation,
} from "../controller/evaluation.controller";

import { protect } from "../lib/middleware/auth.middleware";
import { authorize } from "../lib/middleware/role.middleware";
import { UserRole } from "../lib/entity/User";

const router = Router();

router.use(protect, authorize(UserRole.HR));
router.post("/application/:applicationId/calculate", calculateCandidateScore);

router.get("/application/:applicationId", getCandidateEvaluation);

export default router;
