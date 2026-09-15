import { Router } from "express";

import {
  calculateCandidateScore,
  getCandidateRankingByJob,
  getCandidateEvaluation,
} from "../controller/ranking.controller";

import { protect } from "../lib/middleware/auth.middleware";
import { authorize } from "../lib/middleware/role.middleware";
import { UserRole } from "../lib/entity/User";

const router = Router();

router.post(
  "/application/:applicationId/calculate",
  protect,
  authorize(UserRole.HR),
  calculateCandidateScore,
);

router.get(
  "/job/:jobId",
  protect,
  authorize(UserRole.HR),
  getCandidateRankingByJob,
);

router.get(
  "/application/:applicationId",
  protect,
  authorize(UserRole.HR),
  getCandidateEvaluation,
);

export default router;
