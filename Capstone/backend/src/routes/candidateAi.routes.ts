import express from "express";
import { generateCandidateSummary } from "../controller/candidateAi.controller";
import { protect } from "../lib/middleware/auth.middleware";
import { authorize } from "../lib/middleware/role.middleware";
import { UserRole } from "../lib/entity/User";
const router = express.Router();

router.post(
  "/application/:applicationId/generate",
  protect,
  authorize(UserRole.HR),
  generateCandidateSummary,
);

export default router;
