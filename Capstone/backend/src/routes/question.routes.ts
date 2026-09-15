import { Router } from "express";

import {
  createQuestion,
  getQuestionsByRound,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controller/question.controller";

import { protect } from "../lib/middleware/auth.middleware";

import { authorize } from "../lib/middleware/role.middleware";

import { validate } from "../lib/middleware/validate.middleware";

import { UserRole } from "../lib/entity/User";

import {
  createQuestionSchema,
  updateQuestionSchema,
} from "../lib/validation/question.validation";

const router = Router();

// Get questions for a round
router.get("/round/:roundId", protect, getQuestionsByRound);

// Get one question
router.get("/:id", protect, getQuestionById);

// HR - Create question
router.post(
  "/round/:roundId",
  protect,
  authorize(UserRole.HR),
  validate(createQuestionSchema),
  createQuestion,
);

// HR - Update question
router.put(
  "/:id",
  protect,
  authorize(UserRole.HR),
  validate(updateQuestionSchema),
  updateQuestion,
);

// HR - Delete question
router.delete("/:id", protect, authorize(UserRole.HR), deleteQuestion);

export default router;
