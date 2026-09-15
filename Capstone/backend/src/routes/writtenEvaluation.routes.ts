import { Router } from "express";
import {
  evaluateWrittenManually,
  evaluateWrittenWithAIController,
} from "../controller/writtenEvaluation.controller";
import { protect } from "../lib/middleware/auth.middleware";
import { authorize } from "../lib/middleware/role.middleware";
import { UserRole } from "../lib/entity/User";

const router = Router();

router.patch(
  "/:answerId/manual",
  protect,
  authorize(UserRole.HR),
  evaluateWrittenManually,
);

router.post(
  "/:answerId/ai",
  protect,
  authorize(UserRole.HR),
  evaluateWrittenWithAIController,
);

export default router;
