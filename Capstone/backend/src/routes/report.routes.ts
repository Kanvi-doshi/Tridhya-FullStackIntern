import express from "express";
import { generateCandidateReport } from "../controller/report.controller";
import { protect } from "../lib/middleware/auth.middleware";
import { authorize } from "../lib/middleware/role.middleware";
import { UserRole } from "../lib/entity/User";

const router = express.Router();

router.get(
  "/candidate/:applicationId",
  protect,
  authorize(UserRole.HR),
  generateCandidateReport,
);

export default router;
