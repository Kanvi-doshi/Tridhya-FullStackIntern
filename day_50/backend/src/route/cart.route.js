import express from "express";

import { protect } from "../components/middleware/auth.middleware.js";
import { validate } from "../components/middleware/validate.middleware.js";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  getAllCart,
  clearCart,
} from "../controller/cart.controller.js";
import {
  addToCartSchema,
  updateCartSchema,
  removeFromCartSchema,
} from "../components/validation/cart.validation.js";
const router = express.Router();

router.post("/", protect, validate(addToCartSchema), addToCart);
router.get("/:userId", protect, getCart);
router.get("/all", protect, getAllCart);
router.put("/", protect, validate(updateCartSchema), updateCart);
router.delete("/clear", protect, clearCart);
router.delete("/", protect, validate(removeFromCartSchema), removeFromCart);

export default router;
