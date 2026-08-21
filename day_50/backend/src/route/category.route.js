import express from "express";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controller/category.controller.js";
import { validate } from "../components/middleware/validate.middleware.js";
import {
  protect,
  adminOnly,
} from "../components/middleware/auth.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../components/validation/category.validation.js";

const router = express.Router();

router.post("/", protect, validate(createCategorySchema), createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put(
  "/:id",
  protect,
  adminOnly,
  validate(updateCategorySchema),
  updateCategory,
);
router.delete("/:id",protect,adminOnly, deleteCategory);

export default router;
