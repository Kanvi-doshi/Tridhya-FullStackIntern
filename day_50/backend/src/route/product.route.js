import express from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controller/product.controller.js";
import { validate } from "../components/middleware/validate.middleware.js";
import {
  protect,
  adminOnly,
} from "../components/middleware/auth.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../components/validation/product.validation.js";

import upload from "../components/middleware/upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  validate(createProductSchema),
  createProduct,
);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  validate(updateProductSchema),
  updateProduct,
);
router.delete("/:id",protect,adminOnly,deleteProduct);

export default router;
